import express from 'express'
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api'
require('dotenv').config()

const app = express()

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env

Shopify.Context.initialize({
	API_KEY,
	API_SECRET_KEY,
	SCOPES: [SCOPES],
	HOST_NAME: HOST,
	IS_EMBEDDED_APP: true,
	API_VERSION: ApiVersion.April21
})

app.listen(3000, () => {
	console.log('Node api server is now listening on port 300')
})

app.get('/', (req, res) => {
	res.send('Success')
})
