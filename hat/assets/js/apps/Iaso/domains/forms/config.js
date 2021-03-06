import React from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router';

// import DeleteDialog from '../../components/dialogs/DeleteDialogComponent';
import FormDialogComponent from './components/FormDialogComponent';
import IconButtonComponent from '../../components/buttons/IconButtonComponent';
import ColumnTextComponent from '../../components/tables/ColumnTextComponent';
import { textPlaceholder } from '../../constants/uiConstants';
import { baseUrls } from '../../constants/urls';
import { getOrgUnitParentsIds } from '../orgUnits/utils';

import MESSAGES from './messages';

const formsTableColumns = (
    formatMessage,
    component,
    showEditAction = true,
    showMappingAction = true,
) => [
    {
        Header: formatMessage(MESSAGES.name),
        accessor: 'name',
        Cell: settings => <ColumnTextComponent text={settings.original.name} />,
    },
    {
        Header: formatMessage(MESSAGES.created_at),
        accessor: 'created_at',
        Cell: settings => (
            <ColumnTextComponent
                text={moment
                    .unix(settings.original.created_at)
                    .format('DD/MM/YYYY HH:mm')}
            />
        ),
    },
    {
        Header: formatMessage(MESSAGES.updated_at),
        accessor: 'updated_at',
        Cell: settings => (
            <ColumnTextComponent
                text={moment
                    .unix(settings.original.updated_at)
                    .format('DD/MM/YYYY HH:mm')}
            />
        ),
    },
    {
        Header: formatMessage(MESSAGES.instance_updated_at),
        accessor: 'instance_updated_at',
        Cell: settings => {
            const dateText = settings.original.instance_updated_at
                ? moment
                      .unix(settings.original.instance_updated_at)
                      .format('DD/MM/YYYY HH:mm')
                : textPlaceholder;

            return <ColumnTextComponent text={dateText} />;
        },
    },
    {
        Header: formatMessage(MESSAGES.type),
        sortable: false,
        accessor: 'org_unit_types',
        Cell: settings => (
            <ColumnTextComponent
                text={settings.original.org_unit_types
                    .map(o => o.short_name)
                    .join(', ')}
            />
        ),
    },
    {
        Header: formatMessage(MESSAGES.records),
        accessor: 'instances_count',
        Cell: settings => (
            <ColumnTextComponent text={settings.original.instances_count} />
        ),
    },
    {
        Header: formatMessage(MESSAGES.form_id),
        sortable: false,
        Cell: settings => (
            <ColumnTextComponent text={settings.original.form_id} />
        ),
    },
    {
        Header: formatMessage(MESSAGES.latest_version_files),
        sortable: false,
        Cell: settings =>
            settings.original.latest_form_version !== null && (
                <Grid container spacing={1} justify="center">
                    <Grid item>
                        <ColumnTextComponent
                            text={
                                settings.original.latest_form_version.version_id
                            }
                        />
                    </Grid>
                    <Grid container spacing={1} justify="center">
                        {settings.original.latest_form_version.xls_file && (
                            <Grid item>
                                <Link
                                    download
                                    href={
                                        settings.original.latest_form_version
                                            .xls_file
                                    }
                                >
                                    XLS
                                </Link>
                            </Grid>
                        )}
                        <Grid item>
                            <Link
                                download
                                href={
                                    settings.original.latest_form_version.file
                                }
                            >
                                XML
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>
            ),
    },
    {
        Header: formatMessage(MESSAGES.actions),
        resizable: false,
        sortable: false,
        width: 150,
        Cell: settings => {
            let urlToInstances = `${baseUrls.instances}/formId/${settings.original.id}`;
            if (component.state.currentOrgUnit !== undefined) {
                const parentIds = getOrgUnitParentsIds(
                    component.state.currentOrgUnit,
                );
                parentIds.push(component.state.currentOrgUnit.id);
                urlToInstances += `/levels/${parentIds.join(',')}`;
            }

            return (
                <section>
                    {settings.original.instances_count > 0 && (
                        <IconButtonComponent
                            url={`${urlToInstances}`}
                            icon="remove-red-eye"
                            tooltipMessage={MESSAGES.view}
                        />
                    )}
                    {showEditAction && (
                        <FormDialogComponent
                            renderTrigger={({ openDialog }) => (
                                <IconButtonComponent
                                    onClick={openDialog}
                                    icon="edit"
                                    tooltipMessage={MESSAGES.edit}
                                />
                            )}
                            onSuccess={() =>
                                component.setState({ isUpdated: true })
                            }
                            initialData={settings.original}
                            titleMessage={MESSAGES.update}
                            key={settings.original.updated_at}
                        />
                    )}
                    {showMappingAction && (
                        <IconButtonComponent
                            url={`/forms/mappings/formId/${settings.original.id}/order/form_version__form__name,form_version__version_id,mapping__mapping_type/pageSize/20/page/1`}
                            icon="dhis"
                            tooltipMessage={MESSAGES.dhis2Mappings}
                        />
                    )}
                    {/* {
                        // TODO: deactivated, hard delete is too dangerous - to discuss
                        false && (
                            <DeleteDialog
                                disabled={settings.original.instances_count > 0}
                                titleMessage={MESSAGES.deleteFormTitle}
                                message={MESSAGES.deleteFormText}
                                onConfirm={closeDialog =>
                                    component
                                        .deleteForm(settings.original)
                                        .then(closeDialog)
                                }
                            />
                        )
                    } */}
                </section>
            );
        },
    },
];
export default formsTableColumns;
