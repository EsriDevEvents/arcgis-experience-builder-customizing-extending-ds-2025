/* JIMU IMPORTS */
import {
  React,
  hooks,
  Immutable,
  AllDataSourceTypes,
  type UseDataSource,
} from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import {
  SettingRow,
  SettingSection,
} from "jimu-ui/advanced/setting-components";
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";

/* LOCAL IMPORTS */
import { type IMConfig } from "../config";
import defaultI18nMessages from "./translations/default";

/* COMPONENT */
export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  // PROPS
  const { config, widgetId, useDataSources } = props;

  // USE THE TRANSLATION HOOK
  const t = hooks.useTranslation(defaultI18nMessages);

  // On data source selected, set the data source
  const onDataSourceSelected = (useDataSources: UseDataSource[]) => {
    props.onSettingChange({
      id: widgetId,
      useDataSources: useDataSources,
    });
  };

  /* RENDER */
  return (
    <React.Fragment>
      <SettingSection title={t("dataSourceTitle")}>
        <SettingRow
          className='setting-row'
          label={t("dataSourcesLabel")}
          flow='wrap'
        >
          <DataSourceSelector
            types={Immutable([AllDataSourceTypes.FeatureLayer])}
            mustUseDataSource
            useDataSources={useDataSources}
            onChange={onDataSourceSelected}
            widgetId={widgetId}
          />
        </SettingRow>
      </SettingSection>
    </React.Fragment>
  );
}
