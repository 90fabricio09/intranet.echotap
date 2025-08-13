import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

const App = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Outlet />
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;