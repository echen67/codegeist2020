import ForgeUI, {
  render,
  Fragment,
  Macro,
  Text,
  Button,
  ConfigForm,
  TextField,
  Image,
  useConfig
} from "@forge/ui";
import api from "@forge/api";
import { traverse, } from '@atlaskit/adf-utils/traverse.es'; // .es for ES2015

// import ReactDOM from 'react-dom';
// import React, { Component } from "react";
// import MyComp from "./MyComp";
// import MyRadarComp from "../MyRadarComp";

const App = () => {
  // Retrieve the configuration
  const config = useConfig();

  // Size of radar chart
  const chartSize = 500;

  // Draw the circles making up the base of the radar chart
  const circle =
    `<circle
        cx="${chartSize/2}"
        cy="${chartSize/2}"
        r="${chartSize/2}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${chartSize/2}"
        cy="${chartSize/2}"
        r="${.75*chartSize/2}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${chartSize/2}"
        cy="${chartSize/2}"
        r="${.5*chartSize/2}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />
    <circle
        cx="${chartSize/2}"
        cy="${chartSize/2}"
        r="${.25*chartSize/2}"
        fill="#FAFAFA"
        stroke="#999"
        stroke-width=".2"
    />`
  ;

  // Lines radiating out from center
  // Angles: 18, 90, 162, 234, 306
  const line =
    '<line x1="250" y1="250" x2="488" y2="327" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="250" y2="500" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="12" y2="327" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="103" y2="48" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="397" y2="48" style="stroke:#999;stroke-width:0.3" />';

  // Polygon showing users skills for each dimension
  const poly = '<polygon points="488,327 250,500 12,327 103,48 397,48" style="fill:#999999;stroke:#999;stroke-width:0.5;opacity:0.3;" />';

  // Labels for each dimension
  const caption =
    '<text x="495" y="327" fill="#777" >Communication</text>' +
    '<text x="190" y="520" fill="#777" >Technical Knowledge</text>' +
    '<text x="0" y="327" fill="#777" >Leadership</text>' +
    '<text x="70" y="40" fill="#777" >Teamwork</text>' +
    '<text x="399" y="45" fill="#777" >Meeting Deadlines</text>';

  // Combine all elements for the final svg
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 ${chartSize+100} ${chartSize+100}"
                  width="${chartSize}"
                  height="${chartSize}"
                >` + `<g>` + circle + line + poly + caption + `</g>` + `</svg>`

  // Use the configuration values
  return (
    <Fragment>
    <Text>TEST</Text>
    <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        alt='Summary banner'
      />
    <Text content={`${config.name} is ${config.age} years old.`} />
    </Fragment>
  );
};

// Function that defines the configuration UI
// This is the modal that pops up when you edit the macro
const Config = () => {
  return (
    <ConfigForm>
      <TextField name="name" label="Pet name" />
      <TextField name="age" label="Pet age" />
    </ConfigForm>
  );
};

// A macro containing props for the app code, configuration,
// and default configuration values.
export const run = render(
  <Macro
    app={<App />}
    config={<Config />}
    defaultConfig={{
      name: "Unnamed Pet",
      age: "0"
    }}
  />
);
