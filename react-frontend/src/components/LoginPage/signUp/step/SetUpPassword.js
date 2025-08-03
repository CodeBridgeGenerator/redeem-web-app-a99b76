import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import classNames from "classnames";

const PasswordPolicy = ({ text, valid }) => {
  return (
    <p
      className={classNames(
        "flex items-center gap-2 mb-1",
        !valid && "text-[#ADB5BD]",
      )}
    >
      <span className="w-[15px] text-center">
        <i
          className={classNames(
            valid
              ? "text-green-500 pi pi-check"
              : "text-[#ADB5BD] pi pi-circle-fill text-xs",
          )}
        ></i>
      </span>
      {text}
    </p>
  );
};

const SetUpPassword = (props) => {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    setPasswordError,
    confirmPasswordError,
    setConfirmPasswordError,
    onNext,
    loading,
  } = props;
  const [maskPassword, setMaskPassword] = useState(true);
  const [maskConfirmPassword, setMaskConfirmPassword] = useState(true);

  const onEnter = (e) => {
    if (e.key === "Enter") {
      onNext();
    }
  };

  const isMinLength = password.length >= 6;
  const isUppercase = /[A-Z]/.test(password);
  const isNumber = /\d/.test(password);
  const isSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    <div className="signup-form-container">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-xl mb-2">Set up your password</h3>
        <p className="text-gray-600">
          Please enter a strong password that meets the required security
          criteria for your account.
        </p>
      </div>
      <div className="space-y-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <InputText
              type={maskPassword ? "password" : "text"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              className={classNames(passwordError ? "p-invalid" : "", "w-full mobile-input pr-12")}
              onKeyDown={onEnter}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none mobile-password-toggle-btn"
              onClick={() => setMaskPassword(!maskPassword)}
              title={maskPassword ? "Show password" : "Hide password"}
            >
              <i className={`pi ${maskPassword ? "pi-eye" : "pi-eye-slash"} text-lg`}></i>
            </button>
          </div>
          <small className="p-error">{passwordError}</small>
          <div className="mt-3 space-y-1">
            <PasswordPolicy
              text="Minimum of 6 characters"
              valid={isMinLength}
            />
            <PasswordPolicy
              text="Include at least one uppercase letter"
              valid={isUppercase}
            />
            <PasswordPolicy
              text="Include at least one number"
              valid={isNumber}
            />
            <PasswordPolicy
              text="Include at least one symbol"
              valid={isSymbol}
            />
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <InputText
              type={maskConfirmPassword ? "password" : "text"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(null);
              }}
              className={classNames(
                confirmPasswordError ? "p-invalid" : "",
                "w-full mobile-input pr-12",
              )}
              onKeyDown={onEnter}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none mobile-password-toggle-btn"
              onClick={() => setMaskConfirmPassword(!maskConfirmPassword)}
              title={maskConfirmPassword ? "Show password" : "Hide password"}
            >
              <i className={`pi ${maskConfirmPassword ? "pi-eye" : "pi-eye-slash"} text-lg`}></i>
            </button>
          </div>
          <small className="p-error">{confirmPasswordError}</small>
        </div>
        <div className="pt-4">
          <Button
            label="Set up my account"
            className="w-full !rounded-full py-3 text-[16px] mobile-setup-btn"
            onClick={onNext}
            loading={loading}
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default SetUpPassword;
