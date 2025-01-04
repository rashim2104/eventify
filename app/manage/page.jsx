"use client";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  societies,
  ieeeSocieties,
  ieeeSocietiesShort,
  clubs,
  clubsShort,
} from "../../public/data/data";
import { data } from "autoprefixer";

export default function Manage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [fetchEMail, setFetchEmail] = useState("");
  const [currSoc, setCurrSoc] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [dept, setDept] = useState("");
  const [mail, setMail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState("");
  const [displayForm, setDisplayForm] = useState(true);
  const [displayEditForm, setDisplayEditForm] = useState(true);
  const [selectedHosting, setSelectedHosting] = useState("hosting-small");
  const [id, setId] = useState("");

  const handleHostingChange = (value) => {
    setSelectedHosting(value);
    clearForm();
  };
  const clearForm = () => {
    setId("");
    setName("");
    setCollegeName("");
    setDept("");
    setMail("");
    setPassword("");
    setUserType("");
    setIsSuperAdmin("");
  };
  const handleFetch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/fetchUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "fetchUser",
          mail: fetchEMail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "User not found") {
          toast.error("User not found");
          return;
        }
        setId(data.message[0]._id);
        setDept(data.message[0].dept);
        setName(data.message[0].name);
        setMail(data.message[0].email);
        setUserType(data.message[0].userType);
        setIsSuperAdmin(data.message[0].isSuperAdmin);
        setIdNumber(data.message[0].id);
        setCollegeName(data.message[0].college);
        setRole(data.message[0].role);
        setPhone(data.message[0].phone);
        const receivedDept = data.message[0].dept;
        let college = data.message[0].college;
        if (ieeeSocietiesShort.includes(receivedDept)) {
          college = "common";
          setUserType("professionalsocieties");
          setDept("IEEE");
          setCurrSoc(receivedDept);
        } else if (clubsShort.includes(receivedDept)) {
          college = "common";
          setUserType("clubincharge");
          setDept(receivedDept);
        } else if (societies.includes(receivedDept)) {
          college = "common";
          setUserType("professionalsocieties");
        } else {
          setDept(receivedDept);
          setUserType(data.message[0].userType);
        }

        setCollegeName(college);
        toast.success("User fetched successfully.");
      } else {
        toast.error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const handleChangePassword = async () => {
    const response = await fetch("/api/changePwd", {
      method: "POST",
      body: JSON.stringify({ action: "admin", _id: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      clearForm();
      toast.success(data.message);
    } else {
      toast.error("Error changing password");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/editUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          name,
          college: collegeName,
          dept: dept === "IEEE" ? currSoc : userType === "admin" ? "-" : dept,
          mail,
          userType:
            userType === "professionalsocieties" || userType === "clubincharge"
              ? "HOD"
              : userType,
          isSuperAdmin,
          phone,
          role,
          id: idNumber,
        }),
      });
      if (response.ok) {
        clearForm();
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const handleDelete = async (e) => {
    confirm("Are you sure you want to delete the user?");

    try {
      const response = await fetch("/api/fetchUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteUser",
          mail: fetchEMail,
        }),
      });

      if (response.ok) {
        setFetchEmail("");
        clearForm();
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          college:
            collegeName !== "SIT" || collegeName !== "SEC"
              ? "common"
              : collegeName,
          dept: dept === "IEEE" ? currSoc : userType === "admin" ? "-" : dept,
          mail,
          password,
          userType:
            userType === "professionalsocieties" || userType === "clubincharge"
              ? "HOD"
              : userType,
          isSuperAdmin,
        }),
      });

      if (response.ok) {
        // Reset form
        clearForm();
        setDisplayForm(false);
        toast.success("User added successfully!");
      }
    } catch (error) {
      console.error("Failed to add user", error);
      toast.error("Failed to add user");
    }
  };

  if (status === "loading") {
    return (
      <div className="grid place-items-center h-screen text-xl font-extrabold">
        Loading...
      </div>
    );
  }

  const currUser = session?.user?.isSuperAdmin;
  if (currUser === 0) {
    return (
      <h1 className="grid place-items-center h-screen text-7xl text-red-600	font-extrabold">
        Not Authorized !!
      </h1>
    );
  }

  return (
    <>
      <div>
        <ul className="grid w-full gap-6 md:grid-cols-2">
          <li>
            <input
              type="radio"
              id="hosting-small"
              name="hosting"
              value="hosting-small"
              className="hidden peer"
              required
              onChange={() => handleHostingChange("hosting-small")}
              checked={selectedHosting === "hosting-small"}
            />
            <label
              htmlFor="hosting-small"
              className={`inline-flex items-center justify-between w-full p-5 text-gray-500  border border-gray-200 rounded-lg cursor-pointer  ${
                selectedHosting === "hosting-small"
                  ? "bg-blue-500 text-white"
                  : "hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="block">
                <div className="w-full text-lg font-semibold">ADD USER</div>
                <div className="w-full">Add new user to the system</div>
              </div>
              <svg
                className={`w-5 h-5 ms-3 transform ${
                  selectedHosting === "hosting-big"
                    ? "text-gray-500"
                    : "text-white"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"
                />
              </svg>
            </label>
          </li>
          <li>
            <input
              type="radio"
              id="hosting-big"
              name="hosting"
              value="hosting-big"
              className="hidden peer"
              onChange={() => handleHostingChange("hosting-big")}
              checked={selectedHosting === "hosting-big"}
            />
            <label
              htmlFor="hosting-big"
              className={`inline-flex items-center justify-between w-full p-5 text-gray-500 border border-gray-200 rounded-lg cursor-pointer ${
                selectedHosting === "hosting-big"
                  ? "bg-blue-500 text-white"
                  : "hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="block">
                <div className="w-full text-lg font-semibold">EDIT USER</div>
                <div className="w-full">Manage existing user details</div>
              </div>
              <svg
                className={`w-5 h-5 ms-3 transform ${
                  selectedHosting === "hosting-small"
                    ? "text-gray-500"
                    : "text-white"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m4.481 15.659c-1.334 3.916-1.48 4.232-1.48 4.587 0 .528.46.749.749.749.352 0 .668-.137 4.574-1.492zm1.06-1.061 3.846 3.846 11.321-11.311c.195-.195.293-.45.293-.707 0-.255-.098-.51-.293-.706-.692-.691-1.742-1.74-2.435-2.432-.195-.195-.451-.293-.707-.293-.254 0-.51.098-.706.293z"
                  fill-rule="nonzero"
                />
              </svg>
            </label>
          </li>
        </ul>
      </div>

      {selectedHosting === "hosting-small"
        ? displayForm && (
            <>
              <p className="text-3xl m-3   font-bold">Add User</p>
              <form
                onSubmit={handleSubmit}
                className="bg-gray-200 p-4 rounded m-2 md:w-2/3"
              >
                <label className="block mb-4">
                  Name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-md px-3 py-2 mt-1 w-full"
                  />
                </label>
                <label className="block mb-4">
                  User Type
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                  >
                    <option value="" disabled selected>
                      Select a role
                    </option>
                    {/* <option value="student">Student</option> */}
                    <option value="admin">Admin</option>
                    <option value="HOD">HOD</option>
                    <option value="professionalsocieties">
                      Professional Society Head
                    </option>
                    <option value="clubincharge">Club Incharge</option>
                    <option value="staff">Staff</option>
                  </select>
                </label>
                {(userType === "staff" ||
                  userType === "HOD" ||
                  userType === "student" ||
                  userType === "admin") && (
                  <label className="block mb-4">
                    College Name
                    <select
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                      <option value="" disabled className="round">
                        Select a College
                      </option>
                      <option value="SIT">SIT</option>
                      <option value="SEC">SEC</option>
                    </select>
                  </label>
                )}
                {userType === "professionalsocieties" && (
                  <label className="block mb-4">
                    Professional Societies
                    <select
                      value={dept}
                      onChange={(e) => {
                        setDept(e.target.value);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                      {" "}
                      <option value="" selected disabled>
                        Select a Professional Society
                      </option>
                      {societies.map((society, index) => (
                        <option key={index} value={society}>
                          {society}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {userType === "professionalsocieties" &&
                  (dept === "IEEE" || ieeeSocieties.includes(dept)) && (
                    <label className="block mb-4">
                      IEEE Society Name
                      <select
                        value={currSoc}
                        onChange={(e) => setCurrSoc(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        <option value="" disabled>
                          Select an Option
                        </option>
                        {ieeeSocieties.map((option, index) => (
                          <option key={index} value={ieeeSocietiesShort[index]}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                {(userType === "HOD" ||
                  userType === "staff" ||
                  userType === "student") &&
                  collegeName === "SIT" && (
                    <label className="block mb-4">
                      Dept
                      <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        <option value="" selected disabled>
                          Select a Department
                        </option>
                        <option value="CS">CSE</option>
                        <option value="IT">IT</option>
                        <option value="EE">EEE</option>
                        <option value="EC">ECE</option>
                        <option value="ME">MECH</option>
                        <option value="SC">Cyber Security</option>
                        <option value="CO">CCE</option>
                        <option value="AI">AI-DS</option>
                        <option value="MB">MBA</option>
                        <option value="PH">Physics</option>
                        <option value="EN">English</option>
                        <option value="MA">Maths</option>
                        <option value="CH">Chemistry</option>
                        <option value="PD">Physical Education</option>
                        <option value="TA">Tamil</option>
                        <option value="SBIT">IEEE Student Branch</option>
                      </select>
                    </label>
                  )}

                {(userType === "HOD" ||
                  userType === "staff" ||
                  userType === "student") &&
                  collegeName === "SEC" && (
                    <label className="block mb-4">
                      Dept
                      <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        <option value="" selected disabled>
                          Select a Department
                        </option>
                        <option value="AI">AI-DS</option>
                        <option value="AM">AI-ML</option>
                        <option value="CB">CSBS</option>
                        <option value="CS">CSE</option>
                        <option value="EE">EEE</option>
                        <option value="EC">ECE</option>
                        <option value="EI">E&I</option>
                        <option value="ME">MECH</option>
                        <option value="CE">CIVIL</option>
                        <option value="IT">IT</option>
                        <option value="IC">ICE</option>
                        <option value="CI">IOT</option>
                        <option value="MB">MBA</option>
                        <option value="CJ">M.Tech CSE</option>
                        <option value="MU">Mech & Auto</option>
                        <option value="PH">Physics</option>
                        <option value="EN">English</option>
                        <option value="MA">Maths</option>
                        <option value="CH">Chemistry</option>
                        <option value="PD">Physical Education</option>
                        <option value="TA">Tamil</option>
                        <option value="SBEC">IEEE Student Branch</option>
                      </select>
                    </label>
                  )}

                {userType === "clubincharge" && (
                  <div>
                    <label className="block mb-4">
                      Clubs
                      <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        <option value="" disabled selected>
                          Select a Club
                        </option>
                        {clubs.map((club, index) => (
                          <option key={index} value={clubsShort[index]}>
                            {club}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {/* <label className="block mb-4">
          Dept
          <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full" />
        </label> */}
                <label className="block mb-4">
                  Mail
                  <input
                    type="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                  />
                </label>
                <label className="block mb-4">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                  />
                </label>
                <label className="mb-4 flex align-middle gap-2 ">
                  <input
                    type="checkbox"
                    checked={isSuperAdmin}
                    onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  />
                  <span>Super-Admin</span>
                </label>
                <button
                  type="submit"
                  className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                >
                  Add User
                </button>
              </form>
            </>
          )
        : null}

      {selectedHosting === "hosting-big"
        ? displayEditForm && (
            <>
              <p className="text-3xl m-3 font-bold">Edit User</p>
              <form
                onSubmit={handleFetch}
                className="bg-gray-200 p-4 rounded m-2 md:w-2/3"
              >
                <label className="block mb-4">
                  Email Address
                  <input
                    type="email"
                    required
                    name="fetchEmail"
                    id="fetchEmail"
                    onChange={(e) => setFetchEmail(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                  />
                </label>
                <button
                  type="button"
                  className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                  onClick={(e) => {
                    handleFetch(e);
                  }}
                >
                  Fetch User
                </button>
              </form>

              {id.length != "" && (
                <form className="bg-gray-200 p-4 rounded m-2 md:w-2/3">
                  <label className="block mb-4">
                    User Name
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border rounded-md px-3 py-2 mt-1 w-full"
                    />
                  </label>
                  <label className="block mb-4">
                    Email Address
                    <input
                      type="email"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      disabled
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                  </label>
                  {/* <label className="block mb-4">
              User Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full" />
            </label> */}
                  <label className="block mb-4">
                    User Type
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                      <option value="" disabled selected>
                        Select a role
                      </option>
                      {/* <option value="student">Student</option> */}
                      <option value="admin">Admin</option>
                      <option value="HOD">HOD</option>
                      <option value="professionalsocieties">
                        Professional Society Head
                      </option>
                      <option value="clubincharge">Club Incharge</option>
                      <option value="staff">Staff</option>
                    </select>
                  </label>

                  {(userType === "staff" ||
                    userType === "HOD" ||
                    userType === "student" ||
                    userType === "admin") && (
                    <label className="block mb-4">
                      College Name
                      <select
                        value={collegeName}
                        onChange={(e) => {
                          setCollegeName(e.target.value);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        <option value="" disabled className="round">
                          Select a College
                        </option>
                        <option value="SIT">SIT</option>
                        <option value="SEC">SEC</option>
                      </select>
                    </label>
                  )}

                  {userType === "professionalsocieties" && (
                    <label className="block mb-4">
                      Professional Societies
                      <select
                        value={dept}
                        onChange={(e) => {
                          setDept(e.target.value);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      >
                        {" "}
                        <option value="" selected disabled>
                          Select a Professional Society
                        </option>
                        {societies.map((society, index) => (
                          <option key={index} value={society}>
                            {society}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {userType === "professionalsocieties" &&
                    (dept === "IEEE" || ieeeSocieties.includes(dept)) && (
                      <label className="block mb-4">
                        IEEE Society Name
                        <select
                          value={currSoc}
                          onChange={(e) => setCurrSoc(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        >
                          <option value="" disabled>
                            Select an Option
                          </option>
                          {ieeeSocieties.map((option, index) => (
                            <option
                              key={index}
                              value={ieeeSocietiesShort[index]}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                  {(userType === "HOD" ||
                    userType === "staff" ||
                    userType === "student") &&
                    collegeName === "SIT" && (
                      <label className="block mb-4">
                        Dept
                        <select
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        >
                          <option value="" selected disabled>
                            Select a Department
                          </option>
                          <option value="CS">CSE</option>
                          <option value="IT">IT</option>
                          <option value="EE">EEE</option>
                          <option value="EC">ECE</option>
                          <option value="ME">MECH</option>
                          <option value="SC">Cyber Security</option>
                          <option value="CO">CCE</option>
                          <option value="AI">AI-DS</option>
                          <option value="MB">MBA</option>
                          <option value="PH">Physics</option>
                          <option value="EN">English</option>
                          <option value="MA">Maths</option>
                          <option value="CH">Chemistry</option>
                          <option value="PD">Physical Director</option>
                          <option value="TA">Tamil</option>
                          <option value="SBEC">IEEE Student Branch</option>
                        </select>
                      </label>
                    )}

                  {(userType === "HOD" ||
                    userType === "staff" ||
                    userType === "student") &&
                    collegeName === "SEC" && (
                      <label className="block mb-4">
                        Dept
                        <select
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        >
                          <option value="" selected disabled>
                            Select a Department
                          </option>
                          <option value="AI">AI-DS</option>
                          <option value="AM">AI-ML</option>
                          <option value="CB">CSBS</option>
                          <option value="CS">CSE</option>
                          <option value="EE">EEE</option>
                          <option value="EC">ECE</option>
                          <option value="EI">E&I</option>
                          <option value="ME">MECH</option>
                          <option value="CE">CIVIL</option>
                          <option value="IT">IT</option>
                          <option value="IC">ICE</option>
                          <option value="CI">IOT</option>
                          <option value="MB">MBA</option>
                          <option value="CJ">M.Tech CSE</option>
                          <option value="MU">Mech & Auto</option>
                          <option value="PH">Physics</option>
                          <option value="EN">English</option>
                          <option value="MA">Maths</option>
                          <option value="CH">Chemistry</option>
                          <option value="PD">Physical Director</option>
                          <option value="TA">Tamil</option>
                          <option value="SBEC">IEEE Student Branch</option>
                        </select>
                      </label>
                    )}

                  {userType === "clubincharge" && (
                    <div>
                      <label className="block mb-4">
                        Clubs
                        <select
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        >
                          <option value="" disabled selected>
                            Select a Club
                          </option>
                          {clubs.map((club, index) => (
                            <option key={index} value={clubsShort[index]}>
                              {club}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <label className="block mb-4">
                    ID Number
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="border rounded-md px-3 py-2 mt-1 w-full"
                    />
                  </label>
                  <label className="block mb-4">
                    Role
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="border rounded-md px-3 py-2 mt-1 w-full"
                    />
                  </label>
                  <label className="block mb-4">
                    Phone Number
                    <input
                      type="number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border rounded-md px-3 py-2 mt-1 w-full"
                    />
                  </label>
                  <label className="mb-4 flex align-middle gap-2 ">
                    <input
                      type="checkbox"
                      checked={isSuperAdmin}
                      onChange={(e) => setIsSuperAdmin(e.target.checked)}
                    />
                    <span>Is Super-Admin?</span>
                  </label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                      onClick={(e) => {
                        handleUpdate(e);
                        toast.success("User updated successfully.");
                      }}
                    >
                      Update User
                    </button>
                    <button
                      type="button"
                      className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                      onClick={(e) => {
                        handleDelete(e);
                        toast.success("User deleted successfully.");
                      }}
                    >
                      Delete User
                    </button>
                    {id.length != "" && (
                      <>
                        <button
                          type="button"
                          className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
                          onClick={(e) => {
                            handleChangePassword(e);
                          }}
                        >
                          Reset Password
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </>
          )
        : null}
    </>
  );
}
