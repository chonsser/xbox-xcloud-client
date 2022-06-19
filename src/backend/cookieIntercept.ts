import { app, BrowserWindow, session } from 'electron';
import https from 'https';
import TokenStore from './TokenStore';
// import TokenStore from './TokenStore';
// import path from 'path';
// import TokenStore from './TokenStore';

interface CookieToken {
    Token: string;
    UserClaims: any;
}

// const tokenStore = new TokenStore()

export default function (details:any):void {

    if(details.url === 'https://www.xbox.com/?lc=1033'){
        // Catched logout action

        // let windowId = 0
        // if(process.env.ISDEV !== undefined){
        //     windowId = (details.webContentsId-1)
        // } else {
        //     windowId = details.webContentsId
        // }
        // try {
        //     const window = BrowserWindow.fromId(windowId)
        //     window.close()
        // } catch(error){
        //     console.log('Failed to close parent window')
        //     console.log(error)
        // }

        session.defaultSession.clearStorageData()

        app.relaunch()
        app.exit()

    } else if(details.url.includes('/xbox/accountsignin?returnUrl=https%3a%2f%2fwww.xbox.com%2fen-US%2fplay')){
        // We are already logged in..  Lets get the token..

        let cookieFound = false
        let authToken
        let streamingToken

        if(details.requestHeaders !== undefined || details.responseHeaders !== undefined){

            let cookies;
            if(details.requestHeaders !== undefined){
                cookies = details.requestHeaders.Cookie.split('; ')
            } else if(details.responseHeaders !== undefined){
                cookies = details.responseHeaders['Set-Cookie']
            }

            for(const cookie in cookies){
                // console.log(cookies[cookie])
                if(cookies[cookie].includes('XBXXtkhttp://gssv.xboxlive.com/')){
                    const rawCookie = cookies[cookie]

                    const rawCookieContents = decodeURIComponent(rawCookie.split('=')[1].split(';')[0])
                    const jsonToken:CookieToken = JSON.parse(rawCookieContents)

                    streamingToken = jsonToken
                    cookieFound = true;
                } else if(cookies[cookie].includes('XBXXtkhttp://xboxlive.com')){
                    const rawCookie = cookies[cookie]

                    const rawCookieContents = decodeURIComponent(rawCookie.split('=')[1].split(';')[0])
                    const jsonToken:CookieToken = JSON.parse(rawCookieContents)

                    authToken = jsonToken
                }
            }

        } else {
            throw new Error('Uh oh.. We could not get your token :/')
        }

        if(cookieFound === true){
            this.setWebTokens(authToken.UserClaims.uhs, authToken.Token)

            // let windowId = 0
            // if(process.env.ISDEV !== undefined){
            //     windowId = (details.webContentsId-1)
            // } else {
            //     windowId = details.webContentsId
            // }
            // const window = BrowserWindow.fromId(windowId)
            // window.close()
            console.log('Requesting xHome and xCloud tokens..')
            requestStreamingToken(streamingToken, this)
            requestxCloudStreamingToken(streamingToken, this).then((value)  => {
                // do nothing
                
            }).catch((error) => {
                //  Failed to retrieve xcloud Token. Lets close the login window.

                let windowId = 0
                if(process.env.ISDEV !== undefined){
                    windowId = (details.webContentsId-1)
                } else {
                    windowId = details.webContentsId
                }
                try {
                    const window = BrowserWindow.fromId(windowId)
                    window.close()
                } catch(error){
                    console.log('Failed to close parent window in cookieIntercept', details.webContentsId)
                    console.log(error)
                }
            })
        }
    }
}

function requestStreamingToken(streamingToken:CookieToken, tokenStore:TokenStore){
    // Get xHomeStreaming Token
    const data = JSON.stringify({
        "token": streamingToken.Token,
        "offeringId": "xhome"
    })

    const options = {
        hostname: 'xhome.gssv-play-prod.xboxlive.com',
        port: 443,
        path: '/v2/login/user',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    const req = https.request(options, (res) => {
        let responseData = ''
        
        res.on('data', (data) => {
            responseData += data
        })

        res.on('close', () => {
            if(res.statusCode == 200){
                const jsonHomeToken = JSON.parse(responseData.toString())

                tokenStore.setStreamingToken(jsonHomeToken.gsToken)
            } else {
                console.log('- Error while retrieving xHome token')
                console.log('  statuscode:', res.statusCode)
                console.log('  body:', responseData.toString())
            }
        })
    })
    
    req.on('error', (error) => {
        console.log('- Error while retrieving from url:', this.url)
        console.log('  Error:', error)
    })

    req.write(data)
    req.end()
}

function requestxCloudStreamingToken(streamingToken:CookieToken, tokenStore:TokenStore){
    return new Promise((resolve, reject) => {
        // Get xHomeStreaming Token
        const data = JSON.stringify({
            "token": streamingToken.Token,
            "offeringId": "xgpuweb"
        })

        const options = {
            hostname: 'xgpuweb.gssv-play-prod.xboxlive.com',
            port: 443,
            path: '/v2/login/user',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }
        const req = https.request(options, (res) => {
            let responseData = ''
            
            res.on('data', (data) => {
                responseData += data
            })

            res.on('close', () => {
                if(res.statusCode == 200){
                    const xgpuToken = JSON.parse(responseData.toString())
                    tokenStore.setxCloudRegions(xgpuToken.offeringSettings.regions)
                    console.log('xCloud Regions:', xgpuToken.offeringSettings.regions)

                    // Check if we have a region set alreadt
                    if(tokenStore._xCloudRegionHost === ''){

                        let regionHost
                        for(const region in xgpuToken.offeringSettings.regions){

                            if(xgpuToken.offeringSettings.regions[region].isDefault === true){
                                regionHost = xgpuToken.offeringSettings.regions[region].baseUri.substr(8)
                            }
                        }
                        console.log('debug: setting xcloud token using default region', regionHost)
                        tokenStore.setxCloudStreamingToken(xgpuToken.gsToken, regionHost)

                    } else {
                        console.log('debug: setting xcloud token using already set region', tokenStore._xCloudRegionHost)
                        tokenStore.setxCloudStreamingToken(xgpuToken.gsToken, tokenStore._xCloudRegionHost)
                    }

                    
                    resolve(true)
                } else {
                    console.log('- Error while retrieving xCloud token')
                    console.log('  statuscode:', res.statusCode)
                    console.log('  body:', responseData.toString())

                    reject({
                        status: res.statusCode,
                        body: responseData.toString()
                    })
                }
            })
        })
        
        req.on('error', (error) => {
            console.log('- Error while retrieving from url:', this.url)
            console.log('  Error:', error)
            reject(error)
        })

        req.write(data)
        req.end()
    })
}