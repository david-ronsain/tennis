import * as jose from 'jose'

const createAuthToken = async () => {
    return await new jose.SignJWT({
        "login": import.meta.env.VITE_MASTER_LOGIN.toString(),
        "password": import.meta.env.VITE_MASTER_PASSWORD.toString(),
        "iat": Date.now()
    })
    .setExpirationTime(import.meta.env.VITE_JWT_VALIDITY.toString())
    .setProtectedHeader({
        alg: 'HS256',
    })
    .sign(new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET.toString()))
}

const createHeadersWithAuth = async() => ({
    headers: {
        authorization: 'Bearer ' + await createAuthToken()
    }
})

export {
    createAuthToken,
    createHeadersWithAuth
}