const redis = require('redis')
const client = redis.createClient()

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
