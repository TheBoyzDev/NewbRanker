const axios = require('axios');

// Fetch account data from the API
async function FetchAccountData(playerName, playerTag) {
    const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${playerName}/${playerTag}`);
    return response.data;
}

// Fetch rank data from the API
async function FetchRankData(region, puuid) {
    const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/${region}/${puuid}`);
    return response.data;
}

// Fetch whole match data
async function FetchMatchData(matchID) {
    const response = await axios.get(`https://api.henrikdev.xyz/valorant/v2/match/${matchID}`);
    return response.data;
}

// Fetch last game info from the API
async function GetLastGameInfo(puuid) {
    const url = `https://api.henrikdev.xyz/valorant/v1/by-puuid/lifetime/matches/eu/${puuid}?mode=competitive&page=1&size=1`;

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            return {
                status: 'success',
                data: response.data,
            };
        } else {
            return {
                status: 'error',
                message: `Error fetching last game info. Status code: ${response.status}`,
            };
        }
    } catch (error) {
        console.error(error);
        return {
            status: 'error',
            message: 'Error fetching last game info.',
        };
    }
}

module.exports = {
    FetchAccountData,
    FetchRankData,
    GetLastGameInfo,
    FetchMatchData,
};

