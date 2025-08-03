import React from "react";
import { useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { PrimeReactProvider } from 'primereact/api';
import MyRouter from "./MyRouter/MyRouter";
import store from "./utils/store";
import { AppConfigStatic } from "./AppConfigStatic";
import CustomHeader from "./components/Layouts/CustomHeader";
import AppFooter from "./components/Layouts/AppFooter";
import MainLayout from "./components/Layouts/MainLayout";
import LoadingWrapper from "./MyRouter/wrappers/LoadingWrapper";
import ToastWrapper from "./MyRouter/wrappers/ToastWrapper";
import StartupWrapper from "./MyRouter/wrappers/StartupWrapper";


import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/layout/layout.scss";
import "./assets/mainTheme/mainTheme.css";
import "./css/customStyles.css";

const App = () => {
  const location = useLocation();

  const showSideMenuButton = false;
  
  // Show CustomHeader for all pages to maintain consistent navigation
  const shouldShowHeader = true;

  // PrimeReact configuration
  const primeReactConfig = {
    hideOverlaysOnDocumentScrolling: true,
    autoZIndex: true,
    zIndex: {
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100
    }
  };

  return (
    <Provider store={store}>
      <PrimeReactProvider value={primeReactConfig}>
        {shouldShowHeader && <CustomHeader />}
        <MainLayout>
          <MyRouter />
        </MainLayout>

        <LoadingWrapper />
        <ToastWrapper />
        <StartupWrapper />

        <AppConfigStatic
          rippleEffect={true}
          inputStyle={"outlined"}
          layoutMode={"static"}
          layoutColorMode={"light"}
        />
      </PrimeReactProvider>
    </Provider>
  );
};

export default App;
