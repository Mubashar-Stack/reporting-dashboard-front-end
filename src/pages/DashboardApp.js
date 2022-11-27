/* eslint-disable */
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { fShortenNumber } from '../utils/formatNumber';
import { format } from 'date-fns';
import Chart from 'react-apexcharts';
import CanvasJSReact from '../utils/canvasjs.react';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
// material
import { styled } from '@mui/material/styles';
import api from '../http-commn';
import {
  Card,
  CardHeader,
  Grid,
  Container,
  Typography,
  Box,
  TextField,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Input,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
} from '@mui/material';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Modal from '@mui/material/Modal';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/domains';
import { AppWidgetSummary } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Domain_name', label: 'Domain Name', alignRight: false },
  { id: 'Total Ad_Requests', label: 'Total Ad Requests', alignRight: false },
  { id: 'Total Ad_Impressions', label: 'Total Ad Impressions', alignRight: false },
  { id: 'Total Revenue', label: 'Total Revenue', alignRight: false },
  { id: 'eCPM', label: 'eCPM', alignRight: false },
  { id: 'Calculated_Ad_Requests', label: 'Ad Requests', alignRight: false },
  { id: 'Calculated_Ad_Impressions', label: 'Ad Impressions', alignRight: false },
  { id: 'Calculated_Revenue', label: 'Revenue', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.Domain_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function DashboardApp() {
  const now = new Date();
  const [show, setShow] = useState(false);
  const [showdomain, setShowDomain] = useState(false);
  const [fromdate, setFromDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().slice(0, 19).replace('T', ' ')
  );

  const [todate, setToDate] = useState(new Date().toISOString().slice(0, 19).replace('T', ' '));
  const [domainSelected, setDomainSelected] = useState('');

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [allDomainList, setAllDomainList] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [filterTableData, setFilterTableData] = useState([]);
  const [homeStatsFixed, setHomeStatsFixed] = useState(null);
  const [monthwiseData, setMonthwiseData] = useState([]);
  const [chartRevenue, setchartRevenue] = useState([]);
  const [chartImpressions, setchartImpressions] = useState([]);
  const [charteCPM, setcharteCPM] = useState([]);

  useEffect(() => {
    let config = {
      method: 'get',
      url: '/homeStatsFixed',
      headers: {},
    };
    api(config)
      .then(function (response) {
        setHomeStatsFixed(JSON.parse(JSON.stringify(response.data.data)));
        setMonthwiseData(JSON.parse(JSON.stringify(response.data.monthwiseData)));
        chartData(JSON.parse(JSON.stringify(response.data.monthwiseData)));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    let config = {
      method: 'get',
      url: `/homeStats?domain_name=${domainSelected}&start_date=${
        new Date(fromdate).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0]
      }&end_date=${new Date(todate).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0]}`,
      headers: {},
    };
    api(config)
      .then(function (response) {
        console.log(JSON.parse(JSON.stringify(response.data.data.response)));
        setFilterTableData(JSON.parse(JSON.stringify(response.data.data.response)));
        setFilterData(JSON.parse(JSON.stringify(response.data.data)));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [fromdate, todate, domainSelected]);

  useEffect(() => {
    let config = {
      method: 'get',
      url: '/domains',
      headers: {},
    };
    api(config)
      .then(function (response) {
        console.log(JSON.parse(JSON.stringify(response.data.data)));
        setAllDomainList(JSON.parse(JSON.stringify(response.data.data)));
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const chartData = (dataSeries) => {
    let chartRevenue = [];
    let chartImpressions = [];
    let charteCPM = [];
    let monthList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    monthList.map((month, index) => {
      let { Calculated_Ad_Impressions, calculatedRevenue } = dataSeries[month];
      chartRevenue.push({
        x: new Date(new Date().getFullYear(), index, 1),
        y: calculatedRevenue?.toFixed(2),
      });
      chartImpressions.push({
        x: new Date(new Date().getFullYear(), index, 1),
        y: Calculated_Ad_Impressions?.toFixed(2),
      });
      if (calculatedRevenue == 0 || Calculated_Ad_Impressions == 0) {
        charteCPM.push({
          x: new Date(new Date().getFullYear(), index, 1),
          y: 0,
        });
      } else {
        charteCPM.push({
          x: new Date(new Date().getFullYear(), index, 1),
          y: ((calculatedRevenue / Calculated_Ad_Impressions) * 1000)?.toFixed(2),
        });
      }
    });

    console.log('============Chart Data final========================');
    console.log({
      chartRevenue: chartRevenue,
      chartImpressions: chartImpressions,
      charteCPM: charteCPM,
    });
    console.log('====================================');

    setchartRevenue(chartRevenue);
    setchartImpressions(chartImpressions);
    setcharteCPM(charteCPM);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filterData?.response?.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filterTableData) : 0;

  const filteredUsers = applySortFilter(filterTableData, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;
  const style = {
    position: 'absolute',
    top: '40%',
    left: '40%',
    transform: 'translate(-40%, -40%)',
    // width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 10,
  };

  const toggleDataSeries = (e) => {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  };

  const series = [
    {
      name: 'Revenue',
      type: 'line',
      data: chartRevenue,
    },
    {
      name: 'Ads Impressions',
      type: 'line',
      data: chartImpressions,
    },
    {
      name: 'eCPM',
      type: 'line',
      data: charteCPM,
    },
  ];

  const options = {
    chart: {
      height: 400,
      type: 'line',
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [1, 1, 4],
    },
    title: {
      text: 'Current Year Data',
      align: 'left',
      offsetX: 110,
    },
    xaxis: {
      type: 'datetime',

      tickAmount: 'dataPoints',
      tickPlacement: 'between',
      categories: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#008FFB',
        },
        labels: {
          style: {
            colors: '#008FFB',
          },
        },
        title: {
          text: 'Revenue',
          style: {
            color: '#008FFB',
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      {
        seriesName: 'Revenue',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#00E396',
        },
        labels: {
          style: {
            colors: '#00E396',
          },
        },
        title: {
          text: 'Ads Impressions',
          style: {
            color: '#00E396',
          },
        },
      },
      {
        seriesName: 'Ads Impressions',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#FEB019',
        },
        labels: {
          style: {
            colors: '#FEB019',
          },
        },
        title: {
          text: 'eCPM',
          style: {
            color: '#FEB019',
          },
        },
      },
    ],

    legend: {
      horizontalAlign: 'left',
      offsetX: 40,
    },
  };

  return (
    <Page title="User">
      <Container>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back
          </Typography>

          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Yesterday Revenue"
                total={homeStatsFixed?.yesterdayStats?.revenue}
                icon={'ant-design:rise-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Last Week Revenue"
                total={homeStatsFixed?.lastWeekStats?.revenue}
                color="primary"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Current Month Revenue"
                total={homeStatsFixed?.currentMonthStats?.revenue}
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Last Month Revenue"
                total={homeStatsFixed?.lastMonthStats?.revenue}
                color="primary"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
          </Grid>

          <Card sx={{ mt: 4, mb: 4, width: '100%' }}>
            <Chart options={options} series={series} type="line" height={400} />
          </Card>
          {/* <Typography variant="h6" gutterBottom>
            Today Stats
          </Typography> */}
          {/* <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.todayStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.todayStats?.Ad_Impressions}
                color="primary"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.todayStats?.revenue}
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.todayStats?.Calculated_Ad_Requests}
                color="primary"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.todayStats?.Calculated_Ad_Impressions}
                color="primary"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.todayStats?.calculatedRevenue}
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.todayStats?.calculatedRevenue /
                    homeStatsFixed?.todayStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid> */}
          <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
            Yesterday Stats
          </Typography>
          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.yesterdayStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
                color="info"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.yesterdayStats?.Ad_Impressions}
                color="info"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.yesterdayStats?.revenue}
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.yesterdayStats?.Calculated_Ad_Requests}
                color="info"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.yesterdayStats?.Calculated_Ad_Impressions}
                color="info"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.yesterdayStats?.calculatedRevenue}
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.yesterdayStats?.calculatedRevenue /
                    homeStatsFixed?.yesterdayStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid>
          {/* <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
            Current Week Stats
          </Typography>
          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.thisWeekStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
                color="warning"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.thisWeekStats?.Ad_Impressions}
                color="warning"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.thisWeekStats?.revenue}
                color="warning"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.thisWeekStats?.Calculated_Ad_Requests}
                color="warning"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.thisWeekStats?.Calculated_Ad_Impressions}
                color="warning"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.thisWeekStats?.calculatedRevenue}
                color="warning"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.thisWeekStats?.calculatedRevenue /
                    homeStatsFixed?.thisWeekStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="warning"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid> */}
          <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
            Last Week Stats
          </Typography>
          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.lastWeekStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
                color="primary"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.lastWeekStats?.Ad_Impressions}
                color="primary"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.lastWeekStats?.revenue}
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.lastWeekStats?.Calculated_Ad_Requests}
                color="primary"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.lastWeekStats?.Calculated_Ad_Impressions}
                color="primary"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.lastWeekStats?.calculatedRevenue}
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.lastWeekStats?.calculatedRevenue /
                    homeStatsFixed?.lastWeekStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="primary"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
            Current Month Stats
          </Typography>
          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.currentMonthStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
                color="info"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.currentMonthStats?.Ad_Impressions}
                color="info"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.currentMonthStats?.revenue}
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.currentMonthStats?.Calculated_Ad_Requests}
                color="info"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.currentMonthStats?.Calculated_Ad_Impressions}
                color="info"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.currentMonthStats?.calculatedRevenue}
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.currentMonthStats?.calculatedRevenue /
                    homeStatsFixed?.currentMonthStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="info"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
            Last Month Stats
          </Typography>
          <Grid container spacing={2} justifyContent="space-evenly">
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Requests"
                total={homeStatsFixed?.lastMonthStats?.Ad_Requests}
                icon={'ant-design:rise-outlined'}
                color="error"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Impressions"
                total={homeStatsFixed?.lastMonthStats?.Ad_Impressions}
                color="error"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={homeStatsFixed?.lastMonthStats?.revenue}
                color="error"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Requests"
                total={homeStatsFixed?.lastMonthStats?.Calculated_Ad_Requests}
                color="error"
                icon={'ant-design:rise-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Impressions"
                total={homeStatsFixed?.lastMonthStats?.Calculated_Ad_Impressions}
                color="error"
                icon={'ant-design:line-chart-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="Revenue"
                total={homeStatsFixed?.lastMonthStats?.calculatedRevenue}
                color="error"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <AppWidgetSummary
                title="eCPM"
                total={
                  (homeStatsFixed?.lastMonthStats?.calculatedRevenue /
                    homeStatsFixed?.lastMonthStats?.Calculated_Ad_Impressions) *
                  1000
                }
                color="error"
                icon={'ant-design:dollar-outlined'}
              />
            </Grid>
          </Grid>
        </Container>
        <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
          This Week Stats
        </Typography>
        <Card sx={{ mt: 4 }}>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filterTableData}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      id,
                      Domain_name,
                      Ad_Requests,
                      Ad_Impressions,
                      Revenue,
                      eCPM,
                      Calculated_Ad_Requests,
                      Calculated_Ad_Impressions,
                      Calculated_Revenue,
                      create_at,
                    } = row;
                    const isItemSelected = selected.indexOf(Domain_name) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {`${Domain_name}`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{fShortenNumber(Ad_Requests)}</TableCell>
                        <TableCell align="left">{fShortenNumber(Ad_Impressions)}</TableCell>
                        <TableCell align="left">{fShortenNumber(Revenue)}</TableCell>
                        <TableCell align="left">{fShortenNumber(eCPM)}</TableCell>
                        <TableCell align="left">{fShortenNumber(Calculated_Ad_Requests)}</TableCell>
                        <TableCell align="left">{fShortenNumber(Calculated_Ad_Impressions)}</TableCell>
                        <TableCell align="left">{fShortenNumber(Calculated_Revenue)}</TableCell>
                        {/* <TableCell align="left">{new Date(create_at).toString()}</TableCell> */}
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={9} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filterTableData?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
