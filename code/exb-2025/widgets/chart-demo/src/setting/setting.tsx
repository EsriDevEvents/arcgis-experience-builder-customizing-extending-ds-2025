/* JIMU IMPORTS */
import { React, hooks, Immutable, AllDataSourceTypes, type UseDataSource } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
// TODO: https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2

/* LOCAL IMPORTS */
import { type IMConfig } from '../config'
import defaultI18nMessages from './translations/default'

/* COMPONENT */
export default function Setting (props: AllWidgetSettingProps<IMConfig>) {
  const t = hooks.useTranslation(defaultI18nMessages)

  const onDataSourceSelected = (useDataSources: UseDataSource[]) => {
    props.onSettingChange({
      id: props.widgetId,
      useDataSources: useDataSources
    })
  }

  /* RENDER */
  return (
    <React.Fragment>
        <SettingSection title={t('dataSourceTitle')}>
          <SettingRow
            className='setting-row'
            label={t('dataSourcesLabel')}
            flow='wrap'
          >
            <DataSourceSelector
              types={Immutable([AllDataSourceTypes.FeatureLayer])}
              mustUseDataSource
              useDataSources={props.useDataSources}
              onChange={onDataSourceSelected}
              widgetId={props.widgetId}
            />
          </SettingRow>
        </SettingSection>
    </React.Fragment>
  )
}
