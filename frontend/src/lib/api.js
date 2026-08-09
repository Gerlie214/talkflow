import axios from "axios";
import { getDeviceId } from "./storage";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND}/api`;

const client = axios.create({ baseURL: API });

export const listTopics = async (params = {}) => (await client.get("/topics", { params })).data;
export const listCategories = async () => (await client.get("/topics/categories")).data;
export const getTopic = async (id) => (await client.get(`/topics/${id}`)).data;
export const getFreePrompts = async () => (await client.get("/free-prompts")).data;

export const createSession = async (payload) =>
  (await client.post("/sessions", { device_id: getDeviceId(), ...payload })).data;

export const listSessions = async () =>
  (await client.get("/sessions", { params: { device_id: getDeviceId() } })).data;

export const deleteSession = async (id) =>
  (await client.delete(`/sessions/${id}`, { params: { device_id: getDeviceId() } })).data;

export const getStats = async () =>
  (await client.get("/stats", { params: { device_id: getDeviceId() } })).data;

export const createCustomScript = async (payload) =>
  (await client.post("/custom-scripts", { device_id: getDeviceId(), ...payload })).data;

export const listCustomScripts = async () =>
  (await client.get("/custom-scripts", { params: { device_id: getDeviceId() } })).data;

export const getCustomScript = async (id) =>
  (await client.get(`/custom-scripts/${id}`, { params: { device_id: getDeviceId() } })).data;

export const deleteCustomScript = async (id) =>
  (await client.delete(`/custom-scripts/${id}`, { params: { device_id: getDeviceId() } })).data;
