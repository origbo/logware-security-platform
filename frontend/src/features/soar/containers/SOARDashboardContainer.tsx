import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../utils/storeTypes";
import SOARDashboard from "../components/SOARDashboard";
import {
  setActiveSoarTab,
  setActiveAutomationTab,
  setActiveAnomalyTab,
  selectActiveSoarTab,
  selectActiveAutomationTab,
  selectActiveAnomalyTab,
  setInitialized,
} from "../slices/soarSlice";
import {
  useGetPlaybooksQuery,
  useGetRulesQuery,
  useGetActiveExecutionsQuery,
} from "../services/soarService";
import { useGetAnomaliesQuery } from "../services/anomalyService";

/**
 * Container component for the SOAR Dashboard
 * This component connects the dashboard to the Redux store and fetches initial data
 */
const SOARDashboardContainer: React.FC = () => {
  const dispatch = useDispatch();
  const activeSoarTab = useSelector(selectActiveSoarTab);
  const activeAutomationTab = useSelector(selectActiveAutomationTab);
  const activeAnomalyTab = useSelector(selectActiveAnomalyTab);

  // Fetch key data on initial load
  const { data: playbooks } = useGetPlaybooksQuery();
  const { data: rules } = useGetRulesQuery();
  const { data: activeExecutions } = useGetActiveExecutionsQuery();
  const { data: anomalies } = useGetAnomaliesQuery();

  // Handle tab changes
  const handleTabChange = (newValue: number) => {
    dispatch(setActiveSoarTab(newValue));
  };

  const handleAutomationTabChange = (newValue: number) => {
    dispatch(setActiveAutomationTab(newValue));
  };

  const handleAnomalyTabChange = (newValue: number) => {
    dispatch(setActiveAnomalyTab(newValue));
  };

  // Initialize the module on first load
  useEffect(() => {
    // Once initial data is loaded, mark the module as initialized
    if (playbooks && rules && activeExecutions && anomalies) {
      dispatch(setInitialized(true));
    }
  }, [playbooks, rules, activeExecutions, anomalies, dispatch]);

  return (
    <SOARDashboard
      activeTab={activeSoarTab}
      onTabChange={handleTabChange}
      activeAutomationTab={activeAutomationTab}
      onAutomationTabChange={handleAutomationTabChange}
      activeAnomalyTab={activeAnomalyTab}
      onAnomalyTabChange={handleAnomalyTabChange}
    />
  );
};

export default SOARDashboardContainer;
