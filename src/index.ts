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
	API_VERSION: ApiVersion.October20
})

app.get('/', (req, res) => {
	res.send('Success')
})

app.get('/test', async (req, res) => {
	// Required login again - if we don't have session accessToken
	const session = await Shopify.Utils.loadCurrentSession(req, res, true)
	res.json({
		success: 1,
		session
	})
})

app.get('/login', async (req, res) => {
	// TODO: Duplicated "https" on redirect URL from Shopify
	let authRoute = await Shopify.Auth.beginAuth(req, res, SHOP, '/auth/callback', true)
	return res.redirect(authRoute)
})

app.get('/auth/callback', async (req, res) => {
	try {
		await Shopify.Auth.validateAuthCallback(req, res, req.query as unknown as AuthQuery	)
		// TODO: Save token
	} catch (error) {
		console.error(error)
	}

	return res.redirect('/')
})

app.listen(3000, () => {
	console.log('Node api server is now listening on port 300')
})
