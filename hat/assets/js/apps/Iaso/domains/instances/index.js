import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';

import { withStyles, Tabs, Grid, Tab, Box } from '@material-ui/core';

import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

import {
    resetInstances,
    setCurrentForm,
    fetchFormDetail as fetchFormDetailAction,
    setInstances,
    setInstancesSmallDict,
    setInstancesFetching,
    createInstance,
} from './actions';
import { setOrgUnitTypes } from '../orgUnits/actions';
import {
    setDevicesList,
    setDevicesOwnershipList,
} from '../../redux/devicesReducer';
import { setPeriods } from '../periods/actions';
import {
    redirectTo as redirectToAction,
    redirectToReplace as redirectToReplaceAction,
} from '../../routing/actions';

import {
    fetchInstancesAsDict,
    fetchInstancesAsSmallDict,
    fetchOrgUnitsTypes,
    fetchDevices,
    fetchDevicesOwnerships,
    fetchPeriods,
} from '../../utils/requests';

import {
    getInstancesFilesList,
    getInstancesVisibleColumns,
    getInstancesColumns,
    getMetasColumns,
} from './utils';
import { fetchLatestOrgUnitLevelId } from '../orgUnits/utils';

import TopBar from '../../components/nav/TopBarComponent';
import CustomTableComponent from '../../components/CustomTableComponent';
import DownloadButtonsComponent from '../../components/buttons/DownloadButtonsComponent';
import InstancesMap from './components/InstancesMapComponent';
import InstancesFilesList from './components/InstancesFilesListComponent';
import LoadingSpinner from '../../components/LoadingSpinnerComponent';
import InstancesFiltersComponent from './components/InstancesFiltersComponent';
import ColumnsSelectDrawerComponent from '../../components/tables/ColumnsSelectDrawerComponent';
import ExportInstancesDialogComponent from './components/ExportInstancesDialogComponent';
import AddButtonComponent from '../../components/buttons/AddButtonComponent';
import CreateReAssignDialogComponent from './components/CreateReAssignDialogComponent';

import commonStyles from '../../styles/common';

import getTableUrl from '../../utils/tableUtils';
import { baseUrls } from '../../constants/urls';

import MESSAGES from './messages';

const baseUrl = baseUrls.instances;

const defaultOrder = 'updated_at';

const asBackendStatus = status => {
    if (status) {
        return status
            .split(',')
            .map(s => (s === 'ERROR' ? 'DUPLICATED' : s))
            .join(',');
    }
    return status;
};

const styles = theme => ({
    ...commonStyles(theme),
    reactTable: {
        ...commonStyles(theme).reactTable,
        marginTop: theme.spacing(4),
    },
    selectColmunsContainer: {
        paddingRight: theme.spacing(4),
        position: 'relative',
        top: -theme.spacing(2),
    },
});

class Instances extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableColumns: [],
            tab: props.params.tab ? props.params.tab : 'list',
            visibleColumns: [],
        };
    }

    componentWillMount() {
        const {
            dispatch,
            params: { formId, columns },
            params,
            redirectToReplace,
        } = this.props;
        this.props.resetInstances();
        fetchOrgUnitsTypes(dispatch).then(orgUnitTypes =>
            this.props.setOrgUnitTypes(orgUnitTypes),
        );
        fetchDevices(dispatch).then(devices =>
            this.props.setDevicesList(devices),
        );
        fetchDevicesOwnerships(dispatch).then(devicesOwnershipsList =>
            this.props.setDevicesOwnershipList(devicesOwnershipsList),
        );
        fetchPeriods(dispatch, formId).then(periods =>
            this.props.setPeriods(periods),
        );
        if (!columns) {
            const newParams = {
                ...params,
                columns: getMetasColumns().join(','),
            };
            redirectToReplace(baseUrl, newParams);
        }
    }

    componentDidMount() {
        const {
            params: { formId },
            fetchFormDetail,
        } = this.props;
        fetchFormDetail(formId);
        this.fetchInstances();
    }

    componentDidUpdate(prevProps) {
        const {
            params,
            reduxPage,
            intl: { formatMessage },
        } = this.props;
        const { tableColumns } = this.state;
        if (
            params.pageSize !== prevProps.params.pageSize ||
            params.formId !== prevProps.params.formId ||
            params.order !== prevProps.params.order ||
            params.page !== prevProps.params.page
        ) {
            this.fetchInstances();
        }

        if (params.tab !== prevProps.params.tab) {
            this.handleChangeTab(params.tab, false);
        }
        if (
            reduxPage.list &&
            (!isEqual(reduxPage.list, prevProps.reduxPage.list) ||
                tableColumns.length === 0)
        ) {
            this.changeVisibleColumns(
                getInstancesVisibleColumns(
                    formatMessage,
                    reduxPage.list[0],
                    params,
                    defaultOrder,
                ),
            );
        }
    }

    getFilters() {
        const { params } = this.props;
        return {
            form_id: params.formId,
            withLocation: params.withLocation,
            orgUnitTypeId: params.orgUnitTypeId,
            deviceId: params.deviceId,
            periods: params.periods,
            status: asBackendStatus(params.status),
            deviceOwnershipId: params.deviceOwnershipId,
            search: params.search,
            orgUnitParentId: fetchLatestOrgUnitLevelId(params.levels),
            dateFrom: params.dateFrom
                ? moment(params.dateFrom)
                      .startOf('day')
                      .format('YYYY-MM-DD HH:MM')
                : null,
            dateTo: params.dateTo
                ? moment(params.dateTo).endOf('day').format('YYYY-MM-DD HH:MM')
                : null,
            showDeleted: params.showDeleted,
        };
    }

    getEndpointUrl(toExport, exportType = 'csv', asSmallDict = false) {
        const { params } = this.props;
        const urlParams = {
            limit: params.pageSize ? params.pageSize : 20,
            order: params.order ? params.order : `-${defaultOrder}`,
            page: params.page ? params.page : 1,
            asSmallDict: true,
            ...this.getFilters(),
        };
        return getTableUrl(
            'instances',
            urlParams,
            toExport,
            exportType,
            false,
            asSmallDict,
        );
    }

    handleChangeTab(tab, redirect = true) {
        if (redirect) {
            const { redirectToReplace, params } = this.props;
            const newParams = {
                ...params,
                tab,
            };
            redirectToReplace(baseUrl, newParams);
        }
        this.setState({
            tab,
        });
    }

    goBack() {
        const { params, router } = this.props;
        this.props.setCurrentForm(undefined);
        this.props.setInstances([], params, 0, 0);
        router.goBack();
    }

    fetchInstances() {
        const { params, dispatch } = this.props;

        const url = this.getEndpointUrl();
        const urlSmall = this.getEndpointUrl(false, '', true);

        dispatch(this.props.setInstancesFetching(true));
        Promise.all([
            fetchInstancesAsDict(dispatch, url),
            fetchInstancesAsSmallDict(dispatch, urlSmall),
        ]).then(([instancesData, smallInstancesData]) => {
            this.props.setInstances(
                instancesData.instances,
                params,
                instancesData.count,
                instancesData.pages,
            );
            this.props.setInstancesSmallDict(smallInstancesData);
            dispatch(this.props.setInstancesFetching(false));
        });
    }

    changeVisibleColumns(visibleColumns) {
        const {
            intl: { formatMessage },
            redirectToReplace,
            params,
            currentForm,
        } = this.props;

        const tempVisibleColumns =
            !currentForm || currentForm.period_type === null
                ? visibleColumns.filter(column => column.key !== 'period')
                : visibleColumns;

        const newParams = {
            ...params,
            columns: tempVisibleColumns
                .filter(c => c.active)
                .map(c => c.key)
                .join(','),
        };
        this.setState({
            visibleColumns: tempVisibleColumns,
            tableColumns: getInstancesColumns(
                formatMessage,
                tempVisibleColumns,
            ),
        });

        redirectToReplace(baseUrl, newParams);
    }

    openInstanceDetails(instance) {
        this.props.redirectTo(
            `${baseUrls.instanceDetail}/instanceId/${instance.id}`,
            {},
        );
    }

    render() {
        const {
            classes,
            params,
            reduxPage,
            instancesSmall,
            fetching,
            currentForm,
            intl: { formatMessage },
            router,
            prevPathname,
            redirectTo,
        } = this.props;

        const { tab, tableColumns, visibleColumns } = this.state;

        return (
            <section className={classes.relativeContainer}>
                <TopBar
                    title={`${formatMessage(MESSAGES.title)}: ${
                        currentForm ? currentForm.name : ''
                    }`}
                    displayBackButton
                    goBack={() => {
                        if (prevPathname) {
                            router.goBack();
                        } else {
                            redirectTo(baseUrls.forms, {});
                        }
                    }}
                >
                    <Grid container spacing={0}>
                        <Grid xs={10} item>
                            <Tabs
                                value={tab}
                                classes={{
                                    root: classes.tabs,
                                    indicator: classes.indicator,
                                }}
                                onChange={(event, newtab) =>
                                    this.handleChangeTab(newtab)
                                }
                            >
                                <Tab
                                    value="list"
                                    label={formatMessage(MESSAGES.list)}
                                />
                                <Tab
                                    value="map"
                                    label={formatMessage(MESSAGES.map)}
                                />
                                <Tab
                                    value="files"
                                    label={formatMessage(MESSAGES.files)}
                                />
                            </Tabs>
                        </Grid>
                        <Grid
                            xs={2}
                            item
                            container
                            alignItems="center"
                            justify="flex-end"
                            className={classes.selectColmunsContainer}
                        >
                            <ColumnsSelectDrawerComponent
                                options={visibleColumns}
                                setOptions={cols =>
                                    this.changeVisibleColumns(cols)
                                }
                            />
                        </Grid>
                    </Grid>
                </TopBar>

                {(fetching || !instancesSmall) && <LoadingSpinner />}
                <Box className={classes.containerFullHeightPadded}>
                    <InstancesFiltersComponent
                        baseUrl={baseUrl}
                        params={params}
                        onSearch={() => this.fetchInstances()}
                    />
                    {tab === 'list' && tableColumns.length > 0 && (
                        <div className={classes.reactTable}>
                            <CustomTableComponent
                                isSortable
                                pageSize={20}
                                showPagination
                                columns={tableColumns}
                                defaultSorted={[
                                    { id: defaultOrder, desc: false },
                                ]}
                                params={params}
                                defaultPath={baseUrl}
                                dataKey="instances"
                                multiSort={false}
                                fetchDatas={false}
                                canSelect
                                reduxPage={reduxPage}
                                onRowClicked={instance =>
                                    this.openInstanceDetails(instance)
                                }
                            />
                        </div>
                    )}
                    {!fetching && tab === 'map' && (
                        <div className={classes.containerMarginNeg}>
                            <InstancesMap instances={instancesSmall} />
                        </div>
                    )}
                    {tab === 'files' && (
                        <InstancesFilesList
                            files={getInstancesFilesList(instancesSmall)}
                        />
                    )}
                    {tab === 'list' && (
                        <Grid
                            container
                            spacing={0}
                            alignItems="center"
                            className={classes.marginTop}
                        >
                            <Grid
                                xs={12}
                                item
                                className={classes.textAlignRight}
                            >
                                <div className={classes.paddingBottomBig}>
                                    {currentForm && (
                                        <CreateReAssignDialogComponent
                                            titleMessage={
                                                MESSAGES.instanceCreationDialogTitle
                                            }
                                            confirmMessage={
                                                MESSAGES.instanceCreateAction
                                            }
                                            formType={currentForm}
                                            onCreateOrReAssign={
                                                this.props.createInstance
                                            }
                                            renderTrigger={({ openDialog }) => (
                                                <AddButtonComponent
                                                    onClick={openDialog}
                                                />
                                            )}
                                        />
                                    )}
                                    <ExportInstancesDialogComponent
                                        getFilters={() => this.getFilters()}
                                    />
                                    <DownloadButtonsComponent
                                        csvUrl={this.getEndpointUrl(
                                            true,
                                            'csv',
                                        )}
                                        xlsxUrl={this.getEndpointUrl(
                                            true,
                                            'xlsx',
                                        )}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </section>
        );
    }
}
Instances.defaultProps = {
    reduxPage: undefined,
    currentForm: undefined,
    prevPathname: null,
    instancesSmall: null,
};

Instances.propTypes = {
    classes: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    reduxPage: PropTypes.object,
    instancesSmall: PropTypes.any,
    params: PropTypes.object.isRequired,
    setInstances: PropTypes.func.isRequired,
    setInstancesSmallDict: PropTypes.func.isRequired,
    setCurrentForm: PropTypes.func.isRequired,
    currentForm: PropTypes.object,
    redirectTo: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    setOrgUnitTypes: PropTypes.func.isRequired,
    setInstancesFetching: PropTypes.func.isRequired,
    setDevicesList: PropTypes.func.isRequired,
    resetInstances: PropTypes.func.isRequired,
    setDevicesOwnershipList: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    redirectToReplace: PropTypes.func.isRequired,
    prevPathname: PropTypes.any,
    setPeriods: PropTypes.func.isRequired,
    fetchFormDetail: PropTypes.func.isRequired,
    createInstance: PropTypes.func.isRequired,
};

const MapStateToProps = state => ({
    reduxPage: state.instances.instancesPage,
    instancesSmall: state.instances.instancesSmall,
    fetching: state.instances.fetching,
    currentForm: state.instances.currentForm,
    prevPathname: state.routerCustom.prevPathname,
});

const MapDispatchToProps = dispatch => ({
    dispatch,
    setCurrentForm: form => dispatch(setCurrentForm(form)),
    resetInstances: () => dispatch(resetInstances()),
    setInstances: (instances, params, count, pages) =>
        dispatch(setInstances(instances, true, params, count, pages)),
    setInstancesSmallDict: instances =>
        dispatch(setInstancesSmallDict(instances)),
    setInstancesFetching: isFetching =>
        dispatch(setInstancesFetching(isFetching)),
    setOrgUnitTypes: orgUnitTypes => dispatch(setOrgUnitTypes(orgUnitTypes)),
    setDevicesList: devices => dispatch(setDevicesList(devices)),
    setDevicesOwnershipList: devicesOwnershipsList =>
        dispatch(setDevicesOwnershipList(devicesOwnershipsList)),
    setPeriods: periods => dispatch(setPeriods(periods)),
    createInstance: (currentForm, payload) =>
        dispatch(createInstance(currentForm, payload)),
    ...bindActionCreators(
        {
            fetchFormDetail: fetchFormDetailAction,
            redirectTo: redirectToAction,
            redirectToReplace: redirectToReplaceAction,
        },
        dispatch,
    ),
});

export default withStyles(styles)(
    connect(MapStateToProps, MapDispatchToProps)(injectIntl(Instances)),
);
