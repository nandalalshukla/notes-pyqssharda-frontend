"useClient";

import ResetPasswordForm from "@/components/forms/resetPswd";
import React from "react";

const ResetPasswordPage = () => {

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2> 
            <ResetPasswordForm />
        </div>
    );
}
export default ResetPasswordPage;
