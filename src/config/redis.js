const redis = require('redis')
const password = process.env.REDIS_PASSWORD
const client = redis.createClient({
    url : process.env.REDIS_CLIENT_URL
})

const redisCon = async ()=>{
    try {
        client.on('error', err=> console.log(err))
        await client.connect()
        console.log(`Redis connection is establishing now ....`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    redisCon,
    client
}