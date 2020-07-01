const axios = require('axios');

export const ipfsGet = async (url) => {
    try {
      const response = await axios.get(process.env.REACT_APP_IPFS_URL + url)
      return response.data
    } catch(error) {
        console.log(error)
        return null
    }
}


