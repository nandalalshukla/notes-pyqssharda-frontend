"useClient";
import VerifyEmailForm from "@/components/forms/verifyEmailForm";
import React from "react";

const VerifyEmailPage = () => {

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">Verify Email</h2> 
            <VerifyEmailForm />
        </div>
    );
}
export default VerifyEmailPage;