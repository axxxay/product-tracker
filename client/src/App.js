import { Route, Switch } from "react-router-dom";
import './App.css';
import Login from "./components/Login";
import TrackPackageStatus from "./components/TrackPackageStatus";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Switch>
      <Route exact path="/login" component={Login} />
      <ProtectedRoute exact path="/" component={TrackPackageStatus} />
      <ProtectedRoute exact path="/admin" component={AdminPanel} />
    </Switch>
  );
}

export default App;
