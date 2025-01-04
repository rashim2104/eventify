"use client";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdb-react-ui-kit";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Waves from "./Wave/waves";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [viewPassword, setViewPassword] = useState(false);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackUrl");
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter the mail and password.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials. Try again!");
        setIsLoading(false);
        return;
      }
      router.replace(callbackURL || "dashboard");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <MDBContainer className=" s.gradient-form bg-white">
        <MDBRow className="text-center bg-white">
          <MDBCol col="4" className="bg-white">
            <div className="d-flex flex-column md:-ml-80 bg-white">
              <div
                style={{
                  margin: "15px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className="text-center flex flex-col md:flex-row md:gap-5"
              >
                <Image
                  src="/assets/images/SairamEOMS.png"
                  width={200}
                  height={80}
                  quality={100}
                  priority
                  className="object-contain"
                  alt="Sairam EOMS Logo"
                />
                <div
                  style={{ borderLeft: "1px solid #000", height: "80px" }}
                  className="hidden md:block" 
                ></div>
                <Image
                  src="/assets/images/logo.png"
                  width={255}
                  height={100}
                  quality={100}
                  priority
                  className="object-contain"
                  alt="Eventify Logo"
                />
              </div>
              Please login to your account
              <div
                style={{
                  display: "flex",
                  textAlign: "start",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <form onSubmit={handleLogin} className="forme">
                  <label>Username</label>
                  <input
                    className="border border-gray-300 text-gray-900 rounded-full block w-full p-2.5 mb-3 "
                    type="text"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label>Password</label>
                  <div className="relative inline">
                    <input
                      className="border border-gray-300 text-gray-900 rounded-full block w-full p-2.5 mb-3 "
                      type={viewPassword ? "text" : "password"}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute top-8 right-4"
                      onClick={(e) => {
                        setViewPassword((prev) => !prev);
                      }}
                    >
                      <Image
                        src="/assets/icons/eye.png"
                        height={25}
                        width={25}
                        alt="view"
                      />
                    </button>
                  </div>
                  <div
                    style={{ minWidth: "25vw" }}
                    className="text-center pt-1 mb-5 pb-1"
                  >
                    <MDBBtn
                      className=" mb-4 w-100 gradient-custom-2"
                      style={{
                        height: "3rem",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </MDBBtn>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <br />
                  </div>
                </form>
              </div>
            </div>
            <Waves />
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </>
  );
};

export default Login;
