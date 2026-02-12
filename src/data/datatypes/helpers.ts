import { strHasQuotes } from "../../utils/utils";
import { IField } from "../../types";

export const intRegex = /^-?\d*$/;
export const doubleRegex = /^-?\d*.?\d+$/;
export const binaryRegex = /^[01]+$/;

export const checkInt = (field: IField) => intRegex.test(field.default);
export const checkFloat = (field: IField) => doubleRegex.test(field.default);
export const checkBinary = (field: IField) => binaryRegex.test(field.default);
export const checkBit = (field: IField) => binaryRegex.test(field.default);
export const checkNoValidation = (field: IField) => true;

export const checkString = (field: IField) => {
  if (strHasQuotes(field.default)) {
    return field.default.length - 2 <= (Number(field.size) || 0);
  }
  return field.default.length <= (Number(field.size) || 0);
};

export const checkTime = (field: IField) =>
  /^(?:[01]?\d|2[0-3]):[0-5]?\d:[0-5]?\d$/.test(field.default);

export const checkDate = (field: IField) => /^\d{4}-\d{2}-\d{2}$/.test(field.default);

export const checkTimestamp = (field: IField) => {
  if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default)) {
    return false;
  }
  const content = field.default.split(" ");
  const date = content[0].split("-");
  const year = Number.parseInt(date[0]);
  return year >= 1970 && year <= 2038;
};

export const checkDatetime = (field: IField) => {
  if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(field.default)) {
    return false;
  }
  const content = field.default.split(" ");
  const date = content[0].split("-");
  const year = Number.parseInt(date[0]);
  return year >= 1000 && year <= 9999;
};

export const checkBoolean = (field: IField) => {
  const upperDefault = field.default.toUpperCase();
  return (
    field.default === "0" ||
    field.default === "1" ||
    upperDefault === "TRUE" ||
    upperDefault === "FALSE"
  );
};

export const checkTimestampOracle = (field: IField) => {
  if (field.default.toUpperCase() === "CURRENT_TIMESTAMP") {
    return true;
  }
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(field.default);
};

export const checkRaw = (field: IField) => /^[0-9A-Fa-f]+$/.test(field.default);
