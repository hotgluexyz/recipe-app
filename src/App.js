import React from "react";

// Components
import FilePreview from "./components/FilePreview";
import Loading from "./components/Loading";

import { Connections } from 'hotglue-elements';

// API
import { getOutputData } from "./api";
import { API_KEY, ENV_ID, RECIPE_ID, TENANT_ID, FLOW_ID } from "./variables";

// CSS
import './App.css';
import 'hotglue-elements/dist/index.css';

import hotglueLogo from './assets/hotglue-white.svg'

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

  const connectionsStyleOverrides = {
    flowContainer: {
      padding: '0rem',
      margin: '2rem'
    },
    linkedFlow: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }
  }

  return (
    <main>

      <section className='header'>
        <div className='container'>
          <nav>
            <div className='container'>
              <img src={hotglueLogo} alt='hotglue logo' />
            </div>
          </nav>
          <header>
            <div className='container'>
              <h1>Hotglue Contacts recipe</h1>
              <p>
                This is an example React app showing an end-to-end sample of a hotglue-powered integration that pulls <strong>{RECIPE_ID}</strong> data.
                Follow each step below to see a user experience.
              </p>
            </div>
          </header>
        </div>
      </section>

      <aside>
      </aside>

      <section className='connections'>
        <div className='container'>
          <h2>1. Connect a source</h2>
          <p>Start by connecting your {RECIPE_ID} data on the right. <a href="#">I don't have an account.</a></p>
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
        </div>
      </section>

      <aside className='connections'>
        <div className='container'>
          <Connections styleOverrides={connectionsStyleOverrides} tenant={TENANT_ID} onLink={handleSourceLink} />
        </div>
      </aside>

      <section>
        <div className='container'>
          <h2>2. Trigger a job</h2>
          {isLinked
            ? <p>Now that our {RECIPE_ID} data is linked, the user can sync their data. You can also set a schedule to automatically sync new data.</p>
            : <p>Once you link your {RECIPE_ID} data, you can sync it!</p>}
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
        </div>
      </section>

      <aside>
        <div className='container buttonContainer'>
          <div className="button">
            <a style={{ marginLeft: '0', color: '#ffffff' }} className={`btnForward ${!isLinked && "disabled"}`} onClick={startJob}>
              Sync data{loading && <Loading side={"Left"}/>}
            </a>
          </div>
        </div>
      </aside>

      <section>
        <div className='container'>
          <h2>3. Preview your data</h2>
          <p>The <strong>Contacts</strong> from the CRM has been synced! See a preview of the data below.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
          <h3>
            Subheading
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur massa erat, et pretium augue consectetur sit amet.</p>
        </div>
      </section>

      <aside className='data'>
        <div className='container'>
          <div>
            {grid
              ? <FilePreview data={grid}/>
              : <p>Once you connect your {RECIPE_ID} data and run a sync job, data will appear here!</p>}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default App;
