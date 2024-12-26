"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import routes from "../../../../config/routes";
import Cookies from "js-cookie";
import { signUpUser } from "../../../services/user/authService"; // Import the API service
import { useAuth } from "@/src/app/context/AuthContext";
import { toast } from "react-toastify";
import { auth, provider, signInWithPopup } from "../../../../components/GoogleLogin";
import axios from "axios";
import BASE_URL from "@/src/app/utils/constant";

const SignUp = () => {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("breeder_user_id");
    }
  }, []);

  const handleFirebaseGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const { displayName, email, uid } = user;
  
      const payload = {
        email,
        name: displayName,
        social_id: uid,
      };
      const response = await axios.post(`${BASE_URL}/api/user_social_login`, payload);
  
      if (response.status === 200) {
        login({UniqueKey: response.data.data.user_id, type: 'user-type'});
        localStorage.setItem("user_user_id", response.data.data.user_id);
  
      } else {
        toast.error("Login successful, but an error occurred on the server.");
        console.error("Backend Response Error:", response.data);
      }
    } catch (error) {
      console.error("Firebase Google Login Error or Backend Error:", error);
      toast.error("Failed to login with Google.");
    }
  };

  useEffect(() =>{
    if(isAuthenticated){
      toast.error('User Already Login')
      router.push('/user/dashboard-user-profile');
    }
  }, [isAuthenticated])

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Strict email validation
    const phoneRegex = /^(?!\+1)[2-9]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}$/; // U.S. phone numbers without +1 prefix
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/; // Password validation
    
    if (!(emailRegex.test(email) || phoneRegex.test(email))) {
      setErrorMessage("Invalid Email address or U.S. phone number. Ensure the phone number does not include '+1'.");
      return;
    } else if (!passwordRegex.test(password)) {
      setErrorMessage("Password must contain at least 6 characters, including uppercase letters, lowercase letters, numbers, and special characters.");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await signUpUser(formData); // Call the API service

      if (response.data.msg_type === "false") {
        setErrorMessage(response.data.msg || "Validation error");
        setSuccessMessage("");
      } else {
        const expireDate = new Date(new Date().getTime() + 190 * 1000);
        Cookies.set("name", name, { expires: expireDate });
        Cookies.set("email", email, { expires: expireDate });
        Cookies.set("password", password, { expires: expireDate });
        Cookies.set("otp_email", response.data.otp, { expires: expireDate });

        setSuccessMessage(response.data.msg || "Registration successful");
        setErrorMessage("");
        router.push("/user/varification-code");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="breeder-signinflow-wrap">
      <div className="breeder-signinflow-inner">
        <div className="breeder-signin-leftsec">
          <Image
            src="/images/Nextpet-imgs/big-logo.svg"
            alt="Logo"
            width={270}
            height={306}
          />
        </div>
        <div className="breeder-signin-rightsec">
          <form onSubmit={handleSignUp} autoComplete="off">
            <h1>User Sign Up</h1>
            <label className="login-lbl">
              <Image
                src="/images/Nextpet-imgs/breeder-signin-imgs/user.svg"
                alt="User Icon"
                width={20}
                height={20} className="login-lbl-img"
              />
              <input
                type="text"
                className="login-txt"
                placeholder="Name"
                required autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="login-lbl">
              <Image
                src="/images/Nextpet-imgs/breeder-signin-imgs/mail-icon.svg"
                alt="Email Icon" className="login-lbl-img"
                width={20}
                height={20}
              />
              <input
                type="text"
                className="login-txt"
                placeholder="Email/Phone"
                required autoComplete="off" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="login-lbl">
              <Image
                src="/images/Nextpet-imgs/breeder-signin-imgs/pass-icon.svg"
                alt="Password Icon"
                width={20}
                height={20} className="login-lbl-img"
              />
              <input
                type={showPassword ? "text":"password"}
                className="login-txt"
                id="password"
                placeholder="Create Password"
                required autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Image src={showPassword ? "/images/Nextpet-imgs/breeder-signin-imgs/eye-open.svg" : "/images/Nextpet-imgs/breeder-signin-imgs/eye-close.svg"} alt="Password" width={20} height={20} style={{ position: 'absolute', zIndex: 200, right: '10px', width: '50px',height: '14px', top: '17px', cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}/>
            </label>

            {/* Error and Success Messages */}
            {errorMessage && (
              <div style={{ color: "red", marginTop: "10px" }}>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div style={{ color: "green", marginTop: "10px" }}>
                {successMessage}
              </div>
            )}

            <input type="submit" className="login-btn" value="Sign Up" />

            <div className="terms-condition-paragraph">
              <p>
                By signing up, you agree to our <span onClick={() => router.push("/privacy-policy")} style={{paddingRight:'4px', color:'gray', textDecoration:'underline', cursor:'pointer'}}>  Privacy Policy</span>
                and <span onClick={() => router.push("/terms-conditions")} style={{padding:'0 2px', color:'gray', textDecoration:'underline', cursor:'pointer'}}> Terms and Conditions</span>.
              </p>
            </div>
            <div className="or-sec-wrap">
              <h3>Or Sign Up using</h3>
            </div>

            {/* Social Login */}
            <div className="social-login-wrap">
                <Image
                  src="/images/Nextpet-imgs/breeder-signin-imgs/socail1.png"
                  alt="Social 1"
                  width={40} style={{cursor:'pointer'}}
                  height={40} onClick={handleFirebaseGoogleSignUp}
                />
                <Image
                  src="/images/Nextpet-imgs/breeder-signin-imgs/social2.png"
                  alt="Social 2"
                  width={40}
                  height={40} 
                />
                {/* <Image
                  src="/images/Nextpet-imgs/breeder-signin-imgs/social3.png"
                  alt="Social 3"
                  width={30}
                  height={30} 
                /> */}
            </div>

            <div className="dont-have-accountwrap">
              <p>
                Already have an account?
                <Link href="/user/sign-in">Sign In</Link>
              </p>
              <p>
                Not a User? <a href="/breeder/sign-up">Sign Up</a> as a Breeder?
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
