/******************************IMPORTS********************************/
import {
  React,
  type AllWidgetProps,
  DataSourceComponent,
  type FeatureLayerDataSource,
  FormattedMessage,
  hooks
} from 'jimu-core'
import { type FeatureDataRecord } from 'jimu-arcgis'
import * as echarts from 'echarts'

/**********************************LOCAL IMPORTS*********************************/
import { type IMConfig } from '../config'
import defaultI18nMessages from './translations/default'

// DataSource FeatureLayer: https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2
// DataSource WebMap: 019fa672af30459e95ae088c650d745b

/******************************WIDGET FUNCTION********************************/
const Widget = (props: AllWidgetProps<IMConfig>) => {
  /******************************LOCAL STATE********************************/
  const { useDataSources, id, config } = props // Extract the useDataSources and id from the widget's props
  const chartRef = React.useRef<HTMLDivElement>(null) // Create a ref for the chart div
  // Create state variables for the data source, chart, series array, fips array, and countyState array
  const [dataSource, setDataSource] = React.useState<FeatureLayerDataSource>()
  const [chart, setChart] = React.useState<echarts.ECharts>()
  const [seriesArray, setSeriesArray] = React.useState<
  Array<{ name: string, type: string, stack: string, data: number[], emphasize: { focus: string } }>
  >([])
  const [fipsArray, setFipsArray] = React.useState<string[]>([])
  const [countyStateArray, setCountyStateArray] = React.useState<string[]>([])

  // USE THE TRANSLATION HOOK
  const t = hooks.useTranslation(defaultI18nMessages)

  /******************************DATASOURCE FUNCTIONS********************************/
  /**
   * Set the data source once it is created
   * @param dataSource - The data source set in builder configuration
   */
  const onDataSourceCreated = (dataSource: FeatureLayerDataSource) => {
    setDataSource(dataSource)
  }

  /**
   * Output an error message if the data source creation fails
   * @param error - The error message
   */
  const onCreateDataSourceFailed = (error: any) => {
    console.error('Data source creation failed: ', error)
  }

  /******************************CHART FUNCTIONS********************************/

  /**
   * Create the chart using the arrays created from the data source records
   * @returns {void}
   */
  const createChart = () => {
    const option = {
      title: {
        text: `${config.sampleCensusCountyData}`,
        textAlign: 'left',
        textVerticalAlign: 'top'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: seriesArray.map((x) => x.name),
        type: 'scroll',
        orient: 'horizontal',
        itemGap: 5,
        width: 500,
        left: 'center',
        bottom: 0
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          bottom: 40,
          start: 0,
          end: 10,
          minSpan: 10,
          height: 24,
          fillerColor: '#d467a7',
          moveHandleSize: 8,
          moveHandleStyle: { color: '#c90076' },
          dataBackground: { areaStyle: { color: '#d467a7' } },
          selectedDataBackground: '#b30369'
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          minSpan: 10
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          minSpan: 10
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: countyStateArray.map(
          (county, index) => `${county} (${fipsArray[index]})`
        )
      },
      yAxis: {
        type: 'value'
      },
      series: seriesArray
    }

    // Set the chart options and resize the chart when the window is resized
    chart.setOption(option)
    window.addEventListener('resize', () => {
      chart.resize()
    })
  }

  /**
   * Fetch all records from the data source and set state arrays necessary for the chart
   * @returns {void}
   */
  const fetchAllRecords = async () => {
    // Get the total record count
    let recordCount = 0
    await dataSource
      .loadCount({ where: '1=1' }, { widgetId: id })
      .then((count) => {
        recordCount = count
        console.log('Data source record count: ', count)
      })
      .catch((err) => {
        console.error(err)
      })
    const pageSize = dataSource.restLayer.layerDefinition.maxRecordCount // Get the max record count (page size) for the data source
    let allRecords: FeatureDataRecord[] = [] // Create an array to hold all records
    let page = 1 // Set the initial page to 1

    // Fetch all records from the data source using pagination while the allRecords array is less than the record count
    while (allRecords.length < recordCount) {
      await dataSource
        .load(
          {
            where: '1=1',
            returnGeometry: false,
            outFields: ['*'],
            page,
            pageSize
          },
          { widgetId: id }
        )
        .then(async (records) => {
          allRecords = allRecords.concat(records as FeatureDataRecord[])
          page++
        })
        .catch((err) => {
          console.error(err)
        })
    }

    // Create arrays for the chart | TODO: Refactor this to be more dynamic
    const ageUnder5 = allRecords.map((x) => x.feature.attributes.AGE_UNDER5)
    const ageFive17 = allRecords.map((x) => x.feature.attributes.AGE_5_17)
    const ageEighteen21 = allRecords.map((x) => x.feature.attributes.AGE_18_21)
    const ageTwentyTwo29 = allRecords.map(
      (x) => x.feature.attributes.AGE_22_29
    )
    const ageThirty39 = allRecords.map((x) => x.feature.attributes.AGE_30_39)
    const ageForty49 = allRecords.map((x) => x.feature.attributes.AGE_40_49)
    const ageFifty64 = allRecords.map((x) => x.feature.attributes.AGE_50_64)
    const ageSixty5up = allRecords.map((x) => x.feature.attributes.AGE_65_UP)
    const fips = allRecords.map((x) => x.feature.attributes.FIPS)
    const countyName = allRecords.map((x) => x.feature.attributes.NAME)
    const stateName = allRecords.map((x) => x.feature.attributes.STATE_NAME)
    const countyState = countyName.map((x, i) => `${x}, ${stateName[i]}`)

    // Create the series array
    const series = [
      {
        name: 'Age under 5',
        type: 'bar',
        stack: 'Total',
        data: ageUnder5,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 5-17',
        type: 'bar',
        stack: 'Total',
        data: ageFive17,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 18-21',
        type: 'bar',
        stack: 'Total',
        data: ageEighteen21,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 22-29',
        type: 'bar',
        stack: 'Total',
        data: ageTwentyTwo29,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 30-39',
        type: 'bar',
        stack: 'Total',
        data: ageThirty39,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 40-49',
        type: 'bar',
        stack: 'Total',
        data: ageForty49,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 50-64',
        type: 'bar',
        stack: 'Total',
        data: ageFifty64,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Age 65 and up',
        type: 'bar',
        stack: 'Total',
        data: ageSixty5up,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: '65+',
        type: 'bar',
        stack: 'Total',
        data: ageSixty5up,
        emphasize: {
          focus: 'series'
        }
      },
      {
        name: 'Under 5',
        type: 'bar',
        stack: 'Total',
        data: ageUnder5,
        emphasize: {
          focus: 'series'
        }
      }
    ]
    setCountyStateArray(countyState)
    setFipsArray(fips)
    setSeriesArray(series)
  }

  /******************************USEEFFECTS********************************/
  /**
   * Construct the chart instance once the data source is created
   */
  React.useEffect(() => {
    if (!useDataSources?.[0]) {
      return
    }
    const chart = echarts.init(chartRef.current)
    setChart(chart)

    return () => {
      chart.dispose()
    }
  }, [useDataSources])

  /**
   * Fetch all records from the data source and create arrays needed for the chart
   */
  React.useEffect(() => {
    if (dataSource) {
      fetchAllRecords()
    }
  }, [dataSource])

  /**
   * Create the chart once there is a chart and the seriesArray and countyStateArray are populated
   */
  React.useEffect(() => {
    if (chart && countyStateArray.length > 0 && seriesArray.length > 0) {
      createChart()
    }
  }, [chart, seriesArray, countyStateArray])

  /****************************MARK-UP**********************************/
  // If there is no data source, display a message to select a data source
  if (!useDataSources?.[0]) {
    return (
      <FormattedMessage
        id='selectDataSource'
        defaultMessage={t('pleaseSelectDataSource')}
      />
    )
  } else {
    // Return the chart and data source component
    return (
      <div className='widget-demo jimu-widget' style={{ overflow: 'auto' }}>
        <div
          ref={chartRef}
          style={{ width: '90%', height: '95%', overflow: 'auto' }}
        ></div>
        {useDataSources?.[0] && (
          <DataSourceComponent
            useDataSource={useDataSources[0]}
            widgetId={id}
            onDataSourceCreated={onDataSourceCreated}
            onCreateDataSourceFailed={onCreateDataSourceFailed}
          />
        )}
      </div>
    )
  }
}

/******************************WIDGET EXPORT********************************/
export default Widget
