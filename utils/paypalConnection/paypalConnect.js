const express = require('express');
const paypal = require('paypal-rest-sdk');


paypal.configure({
    mode: 'sandbox', // Set to 'sandbox' for testing or 'live' for production
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
  });
  