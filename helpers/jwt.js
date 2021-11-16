// here we will use library to secure our tokens using express-jwt
const expressJWT = require('express-jwt');

function authorizeJWT() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;
    return expressJWT({
            secret,
            algorithms: ['HS256'],
        })
        .unless({
            // APIS users will use easily without authorization 
            path: [{
                    url: /\/public\/uploads(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/public(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/users(.*)/,
                    methods: ['GET']
                },
                {
                    url: /\/api\/v1\/posts(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/categories(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/notifications(.*)/,
                    methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\/api\/v1\/locations(.*)/,
                    methods: ['GET', 'OPTIONS', 'POST']
                },
                {
                    url: /\/api\/v1\/users\/checkemail(.*)/,
                    methods: ['GET', 'OPTIONS', 'POST']
                },
                `${api}/users/login`,
                `${api}/users/register`,
                `${api}/users/checkemail`,
                `${api}/users/newpass/:id`,
            ]
        })
}

module.exports = authorizeJWT;