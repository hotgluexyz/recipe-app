import React from "react";

// Components
import FilePreview from "./components/FilePreview";
import Loading from "./components/Loading";

import { Connections } from 'hotglue-elements';

// API
import { getOutputData } from "./api";
import { API_KEY, ENV_ID, TENANT_ID, FLOW_ID } from "./variables";

// CSS
import './App.css';
import 'hotglue-elements/dist/index.css';

function App() {
  const [grid, setGrid] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [isLinked, setLinked] = React.useState(false);

  React.useEffect(() => {
    if (window.HotGlue && !window.HotGlue.hasMounted()) {
      // Mount hotglue using variables
      window.HotGlue.mount({
          "api_key": API_KEY,
          "env_id": ENV_ID
      });
    }
  }, [window.HotGlue]);

  const refreshData = async () => {
    const data = await getOutputData();
    if (!data) return;

    const output = [Object.keys(data[0])]

    // Map JSON data into a spreadsheet grid view
    data.forEach(r => {
      const row = Object.values(r).map(v => {
        // If the type is not primitive, convert to string
        if (Object(v) === v) {
          return JSON.stringify(v);
        }

        return v;
      });

      output.push(row);
    });

    setGrid(output);
  };

  React.useEffect(() => {
    if (!grid) {
      // If no data, let's trigger a refresh
      refreshData();
    }
  }, [grid]);

  const checkLinked = () => {
    // If hotglue not mounted yet, try again
    if (!window.HotGlue || !window.HotGlue.hasMounted()) {
      setTimeout(() => checkLinked(), 1000);
      return;
    }

    // Check if the user has already linked a flow
    window.HotGlue.getLinkedFlows(TENANT_ID).then(linkedFlows => {
      if (linkedFlows && linkedFlows.find(f => f.id === FLOW_ID)) {
        setLinked(true);
      }
    });
  };

  React.useEffect(() => {
    if (!isLinked)
      checkLinked();
  }, [isLinked]);

  const startJob = async () => {
    if (!window.HotGlue || !window.HotGlue.hasMounted()) return;
    // Start loading
    setLoading(true);

    window.HotGlue.createJob(FLOW_ID, TENANT_ID).then(jobDetails => {
      window.swal("Syncing data", "Starting a data sync. This may take a few minutes!", "success")

      window.HotGlue.pollJob(jobDetails.s3_root, FLOW_ID, TENANT_ID).then(({payload: jobStatus}) => {
        setLoading(false);
        if (jobStatus.status === "JOB_COMPLETED") {
          window.swal("Data synced", "Contacts data has been synced successfully!", "success")
          // Go grab the output
          refreshData();
        } else {
          window.swal("Failed to sync", "There was an issue syncing the data, please contact support for help.", "error")
        }
      });
    });
  };

  const handleSourceLink = async (source, flowId) => {
    setLinked(true);
    window.swal(`${source.label} linked`, "Woohoo! You've linked a source! Now you can sync your data.", "success")
  };

  return (
    <div className="container">
      <h1>hotglue Contacts recipe</h1>
      <p>
        This is a React app showing an end-to-end sample of a hotglue-powered CRM (Salesforce, HubSpot, Pipedrive) integration that pulls <strong>Contacts</strong>.
        Follow each step below to see a user experience.
      </p>

      <h2>Connect your data</h2>
      <p>Start by connecting a CRM below! <a href="#">I don't have a CRM account.</a></p>
      <Connections tenant={TENANT_ID} onLink={handleSourceLink} />

      <h2>Trigger a job</h2>
      {isLinked 
      ? <p>Now that our CRM is linked, the user can sync their data. You can also set a schedule to automatically sync new data.</p>
      : <p>Once you link a CRM, you can sync your data!</p>}
      <div className="button">
        <a style={{ color: '#ffffff' }} className={`btnForward ${!isLinked && "disabled"}`} onClick={startJob}>
          Sync data{loading && <Loading side={"Left"}/>}
        </a>
      </div>

      <h2>Preview your data</h2>
      {grid 
      ? <FilePreview data={grid}/>
      : <p>Once you have connected a CRM and ran a sync, data will appear here!</p>}
    </div>
  );
}

export default App;
