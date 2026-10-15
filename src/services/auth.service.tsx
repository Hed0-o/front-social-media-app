import { routeApi } from "./api";

type signUpData = {
  fullname: string;
  email: string;
  password: string;
  cPassword: string;
  birthDate: string;
  gender: string;
};

type loginData = {
  email: string;
  password: string;
};

export async function signUpService(data: signUpData) {
  const response = await routeApi.post("/users/signup", {
    name: data.fullname,
    email: data.email,
    password: data.password,
    rePassword: data.cPassword,
    dateOfBirth: data.birthDate,
    gender: data.gender.toLowerCase(),
  });
  return response.data;
}

export async function signinService(data: loginData) {
  const response = await routeApi.post("/users/signin", {
    email: data.email,
    password: data.password,
  });
  return response.data;
}
