// Temporary AWS access to the output JSON file from hotglue
// NOTE: In production, you would handle accessing the output in your backend!
import {AWS_ENDPOINT} from "./variables";

export async function getOutputData() {
    // Request to S3, see if data is ready
    const r = await fetch(AWS_ENDPOINT);

    if (!r.ok) {
        // No data yet
        return undefined;
    }

    // Parse as JSON
    const data = await r.json();

    return data;
};
