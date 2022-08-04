export const UPDATE_DASHBOARD_SETTING = 'SETTINGS/UPDATE_DASHBOARD_SETTING';
export const updateDashboardSetting = (setting: string, value: any) => ({
    type: UPDATE_DASHBOARD_SETTING,
    payload: { setting, value },
});


