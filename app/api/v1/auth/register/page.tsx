"useClient";
import RegisterForm from "@/components/forms/registerForm";
import React from "react";

const RegisterPage = () => {
    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
            <RegisterForm />
        </div>
    );
}
export default RegisterPage;

