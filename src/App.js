import React from "react";

// Components
import FilePreview from "./components/FilePreview";
import Loading from "./components/Loading";
import CodeBlock from "./components/CodeBlock";

import { Connections } from 'hotglue-elements';

// API
import { getOutputData } from "./api";
import { API_KEY, ENV_ID, RECIPE_ID, TENANT_ID, FLOW_ID } from "./variables";

// CSS
import './App.css';
import 'hotglue-elements/dist/index.css';

import hotglueLogo from './assets/hotglue.svg'

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

      <nav>
        <div className='container'>
          <img src={hotglueLogo} alt='hotglue logo' style={{
            fill: "white"
          }}/>
        </div>
      </nav>
      <header>
        <div className='container'>
          <h1>{RECIPE_ID} recipe</h1>
          <p>
            This is a sample React app showing an end-to-end sample of a hotglue-powered integration that pulls <strong>{RECIPE_ID}</strong> data.
            Follow each step below to see a user experience.
          </p>
        </div>
      </header>

      <section className='connections'>
        <div className='container'>
          <h2>Connect a source</h2>
          <p style={{marginBottom: 0}}>
            Your users will start by connecting their <strong>{RECIPE_ID}</strong> data source.
          </p>
          <p>
            Try connecting a {RECIPE_ID} source on the right.
          </p>
          <h3>
            Embed the hotglue widget
          </h3>
          <p>
            To add hotglue to your product, start by embedding the widget.
          </p>
          <CodeBlock language={"html"} content={`<script src="https://hotglue.xyz/widget.js"></script>
<script>
    HotGlue.mount({
        "api_key": "${API_KEY}",
        "env_id": "${ENV_ID}"
    });
</script>`}/>
          <a href="https://docs.hotglue.xyz/quickstart/embed#add-the-widget" target="_blank">Read the docs</a> 
          <h3>
            Create an integrations page
          </h3>
          <p>
            Use the hotglue-elements package to show users all the available {RECIPE_ID} sources they can connect to – directly in your product.
          </p>
          <CodeBlock language={"react"} content={`import React from "react"
import {Connections} from "hotglue-elements"
import "hotglue-elements/dist/index.css"

function App() {
  // tenant is the id of the current user
  return <Connections tenant="${TENANT_ID}" />
}`}/>
          <a href="https://docs.hotglue.xyz/quickstart/embed#react-install-hotglue-elements" target="_blank">Read the docs</a>
        </div>
      </section>

      <aside className='connections'>
        <div className='container'>
          <Connections styleOverrides={connectionsStyleOverrides} tenant={TENANT_ID} onLink={handleSourceLink} />
        </div>
      </aside>

      <section>
        <div className='container'>
          <h2>Trigger a job</h2>
          {isLinked
            ? <p>
              Now that the user has linked their {RECIPE_ID} data, they can sync their data to your product. 
              Try it yourself on the right.
            </p>
            : <p>Once users link their {RECIPE_ID} data, they can sync it directly to your platform!</p>}
          <h3>
            Ways to start a sync job
          </h3>
          <p>
            There are several ways to allow users to sync their {RECIPE_ID} data to your product:
            <ul>
              <li>Use the widget to add a manual sync button to your product</li>
              <li>Create a schedule to automatically sync new data</li>
              <li>Use hotglue's API to trigger syncs programmatically</li>
            </ul>
          </p>
          <CodeBlock language={"react"} content={`import React from "react"

function App() {
  const startJob = async () => {
    // Make sure HotGlue is ready
    if (!window.HotGlue || !window.HotGlue.hasMounted()) return;

    // Start the job
    window.HotGlue.createJob(FLOW_ID, TENANT_ID).then(jobDetails => {
      // Let the user know it started
      window.swal(
        "Syncing data",
        "Starting a data sync. This may take a few minutes!",
        "success"
      )
    });
  };

  return (
    <button onClick={startJob}>
      Sync data
    </button>
  );
}`}/>
          <a href="https://docs.hotglue.xyz/jobs/start" target="_blank">Read the docs</a>
        </div>
      </section>

      <aside>
        <div className='container buttonContainer'>
          <div className="button">
            <a style={{ marginLeft: '0', color: '#ffffff' }} className={`btnForward ${!isLinked && "disabled"}`} onClick={startJob}>
              {!loading ? 'Sync data' : 'Syncing'} {loading && <Loading side={"Left"}/>}
            </a>
          </div>
        </div>
      </aside>

      <section>
        <div className='container'>
          <h2>Preview your data</h2>
          {grid
            ? <p>
              The <strong>{RECIPE_ID}</strong> has been synced! See a preview of the data on the right.
            </p>
            : <>
              <p>
                Once users link their {RECIPE_ID} data and run a sync job, the data will be sent to your product's backend.
              </p>
              <p>
                From there, use their data to power your product – try the steps above to see it in action 🚀  
              </p>
            </>}
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
