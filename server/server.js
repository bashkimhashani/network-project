const dgram = require("dgram");
const http = require("http");
const fs = require("fs");
const path = require("path");

const UDP_PORT = 41234;
const HTTP_PORT = 8080;
const MAX_CLIENTS = 10;
const TIMEOUT_MS = 15000;