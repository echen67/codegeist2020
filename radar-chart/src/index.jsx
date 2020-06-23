import ForgeUI, {
  render,
  Macro,
  Text,
  ConfigForm,
  TextField,
  useConfig
} from "@forge/ui";

const App = () => {
  // Retrieve the configuration
  const config = useConfig();

  // Use the configuration values
  return <Text content={`${config.name} is ${config.age} years old.`} />;
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
