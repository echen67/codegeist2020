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

  const chartSize = 500;
  const numScales = 4;

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

  const line =
    '<line x1="250" y1="250" x2="250" y2="500" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="488" y2="327" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="12" y2="327" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="103" y2="48" style="stroke:#999;stroke-width:0.3" />' +
    '<line x1="250" y1="250" x2="397" y2="48" style="stroke:#999;stroke-width:0.3" />';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 ${chartSize+10} ${chartSize+10}"
                  width="${chartSize}"
                  height="${chartSize}"
                >` + `<g>` + circle + line + `</g>` + `</svg>`

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
