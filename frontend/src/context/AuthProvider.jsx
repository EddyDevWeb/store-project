import { useState } from "react";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );

  const login = (userData) => {
    localStorage.setItem(
      "userInfo",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      userData.token
    );

    setUserInfo(userData);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    setUserInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;