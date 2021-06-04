import express from 'express'
import Shopify, { ApiVersion, AuthQuery, GraphqlWithSession, WithSessionParams } from '@shopify/shopify-api'
import RedisStore from './redis-store';

require('dotenv').config()

const sessionStorage = new RedisStore();

const app = express()

const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env

Shopify.Context.initialize({
	API_KEY,
	API_SECRET_KEY,
	SCOPES: [SCOPES],
	HOST_NAME: HOST,
	IS_EMBEDDED_APP: false,
	API_VERSION: ApiVersion.October20,
	SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
		sessionStorage.storeCallback,
		sessionStorage.loadCallback,
		sessionStorage.deleteCallback,
	),
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

app.get('/background-job', async (req, res) => {
	// TODO: loadOfflineSession func not work
	// const session = await Shopify.Utils.loadOfflineSession(SHOP)
	const session = await Shopify.Utils.loadCurrentSession(req, res, true)
	const r = await sessionStorage.loadCallback(session.id)
	console.log('=======> session', SHOP, r)
	res.json({
		success: 1,
		r
	})
})

app.get('/login', async (req, res) => {
	let authRoute = await Shopify.Auth.beginAuth(req, res, SHOP, '/auth/callback', true)
	return res.redirect(authRoute)
})

app.get('/auth/callback', async (req, res) => {
	try {
		await Shopify.Auth.validateAuthCallback(req, res, req.query as unknown as AuthQuery)
		// TODO: Save token
	} catch (error) {
		console.error(error)
	}

	return res.redirect('/')
})

app.get('/products', async (req, res) => {
	// Get accessToken
	const session = await Shopify.Utils.loadCurrentSession(req, res)
	// Create client for shop
	const client = new Shopify.Clients.Rest(session.shop, session.accessToken)
	// Make the API call
	const products = await client.get({
		path: 'products'
	})

	console.log('Load products', products)
	res.json({
		success: 1,
		products
	})
})

app.get('/graph-client', async (req, res) => {
	const clientWithSessionParams: WithSessionParams = {
		clientType: 'graphql',
		isOnline: true,
		req, res
	}

	const { client, session } = await Shopify.Utils.withSession(clientWithSessionParams) as GraphqlWithSession

	const shopName = await client.query({
		data: `
			{
				shop {
					name
				}
			}
		`
	})

	res.json({
		success: 1,
		shopName
	})
})

app.listen(3000, () => {
	console.log('Node api server is now listening on port 300')
})
