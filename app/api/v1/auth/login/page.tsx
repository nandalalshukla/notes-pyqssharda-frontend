"useClient";

import LoginForm from "@/components/forms/loginForm";
import React from "react";

const LoginPage = () => {
    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">  
            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
            <LoginForm />
        </div>
    );
}
export default LoginPage;
