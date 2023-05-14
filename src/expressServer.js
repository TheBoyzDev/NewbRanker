// Express.js server
const express = require('express');
const app = express();
const axios = require('axios');
const URLSearchParams = require('url').URLSearchParams;
const ValorantPlayer = require('./models/ValorantPlayer')

app.get('/oauth-finished.html', async (req, res) => {
    if (!req.query.state) return res.redirect(`/rso?uuid=null`);

    // Save query values to ValorantPlayer database
    const fstate = await ValorantPlayer.findOne({ code: req.query.state });

    // If state doesn't exist in the database, return an error
    if (!fstate) {
        return res.status(500).json({ error: 'State not found in the database' });
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', req.query.code);
    formData.append('redirect_uri', 'https://valorantlabs.xyz/oauth-finished.html');

    const tokens = await axios
        .post('https://auth.riotgames.com/token', formData, {
            headers: {Authorization: `Basic ${Buffer.from(process.env.RIOT_CLIENT_SECRET).toString('base64')}`},
        })
        .catch(e => e);

    if (tokens.response) return res.send('Error obtaining access token');

    const userinfo = await axios
        .get('https://europe.api.riotgames.com/riot/account/v1/accounts/me', {
            headers: {Authorization: `Bearer ${tokens.data.access_token}`},
        })
        .catch(e => e);

    if (userinfo.response) return res.send('Error obtaining user information');

    // Save userinfo.data to your database and link with corresponding Discord user
    const existingUser = await ValorantPlayer.findOne({ discordId: fstate.discordId });
    if (existingUser) {
        existingUser.val_puuid = userinfo.data.puuid;
        existingUser.val_name = userinfo.data.gameName;
        existingUser.val_tag = userinfo.data.tagLine;
        await existingUser.save();
    } else {
        const newUser = new ValorantPlayer({
            discordId: fstate.discordId,
            val_puuid: userinfo.data.puuid,
            val_name: userinfo.data.gameName,
            val_tag: userinfo.data.tagLine
        });
        await newUser.save();
    }

    res.send('Successfully logged in!');
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));