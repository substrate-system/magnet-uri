/*! magnet-uri. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */
import { parse, compose } from 'bep53-range'
import { fromString, toString } from 'uint8arrays'
import { decode as uDecode } from './util.js'
const hex2arr = (hex:string) => fromString(hex, 'hex')
const arr2hex = (arr:Uint8Array) => toString(arr, 'hex')

/**
 * @see {@link https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/magnet-uri/index.d.ts @types/magnet-uri}
 */
export interface ParsedMagnet {
    dn?:string;
    tr?:string|string[];
    xs?:string|string[];
    as?:string|string[];
    ws?:string|string[];
    kt?:string|string[];
    ix?:number|number[];
    xt?:string|string[];
    so?:number[];
    xl?:string;
    'x.pe'?:string[]|string;
    publicKey?:string;
    publicKeyBuffer?:Uint8Array;
    peerAddresses?:string[];
    infoHash:string;
    infoHashV2?:string;
    infoHashBuffer?:ArrayBufferView;
    infoHashV2Buffer?:Uint8Array;
    name:string;
    keywords?:string|string[];
    announce?:string[];
    urlList?:string[];
}

/**
 * Parse a magnet URI and return an object of keys/values
 *
 * @param  {string} uri
 * @return {ParsedMagnet} the parsed uri
 */
export function decode (uri:string):ParsedMagnet {
    const result:Partial<ParsedMagnet> = {
        announce: [],
        urlList: [],
        peerAddresses: []
    }

    // Support 'magnet:' and 'stream-magnet:' uris
    const data = uri.split('magnet:?')[1]

    const params:string[] = ((data && data.length >= 0) ? data.split('&') : [])

    params.forEach(param => {
        const keyval = param.split('=')

        // This keyval is invalid, skip it
        if (keyval.length !== 2) return

        const key = keyval[0]
        let val:string|string[]|number|number[] = keyval[1]

        // Clean up torrent name
        if (key === 'dn') {
            val = decodeURIComponent(val).replace(/\+/g, ' ')
        }

        // Address tracker (tr), exact source (xs), and acceptable source (as) are encoded
        // URIs, so decode them
        if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
            val = decodeURIComponent(val)
        }

        // Return keywords as an array
        if (key === 'kt') {
            val = decodeURIComponent(val).split('+')
        }

        // Cast file index (ix) to a number
        if (key === 'ix') {
            val = Number(val)
        }

        // bep53
        if (key === 'so') {
            val = parse(decodeURIComponent(val as string).split(','))
        }

        // If there are repeated parameters, return an array of values
        if (result[key]) {
            if (!Array.isArray(result[key])) {
                result[key] = [result[key]]
            }

            result[key].push(val)
        } else {
            result[key] = val
        }
    })

    // Convenience properties for parity with `parse-torrent-file` module
    let m
    if (result.xt) {
        const xts = Array.isArray(result.xt) ? result.xt : [result.xt]
        xts.forEach(xt => {
            if ((m = xt.match(/^urn:btih:(.{40})/))) {
                result.infoHash = m[1].toLowerCase()
            } else if ((m = xt.match(/^urn:btih:(.{32})/))) {
                console.log('mmmmmmmm', m)
                result.infoHash = arr2hex(uDecode(m[1]))
            } else if ((m = xt.match(/^urn:btmh:1220(.{64})/))) {
                result.infoHashV2 = m[1].toLowerCase()
            }
        })
    }

    if (result.xs) {
        const xss = Array.isArray(result.xs) ? result.xs : [result.xs]
        xss.forEach(xs => {
            if ((m = xs.match(/^urn:btpk:(.{64})/))) {
                result.publicKey = m[1].toLowerCase()
            }
        })
    }

    if (result.infoHash) result.infoHashBuffer = hex2arr(result.infoHash)
    if (result.infoHashV2) result.infoHashV2Buffer = hex2arr(result.infoHashV2)
    if (result.publicKey) result.publicKeyBuffer = hex2arr(result.publicKey)

    if (result.dn) result.name = result.dn
    if (result.kt) result.keywords = result.kt

    result.announce = []
    if (typeof result.tr === 'string' || Array.isArray(result.tr)) {
        result.announce = result.announce.concat(result.tr)
    }

    result.urlList = []
    if (typeof result.as === 'string' || Array.isArray(result.as)) {
        result.urlList = result.urlList.concat(result.as)
    }
    if (typeof result.ws === 'string' || Array.isArray(result.ws)) {
        result.urlList = result.urlList.concat(result.ws)
    }

    result.peerAddresses = []
    if (typeof result['x.pe'] === 'string' || Array.isArray(result['x.pe'])) {
        result.peerAddresses = result.peerAddresses.concat(result['x.pe'])
    }

    // remove duplicates by converting to Set and back
    result.announce = Array.from(new Set(result.announce))
    result.urlList = Array.from(new Set(result.urlList))
    result.peerAddresses = Array.from(new Set(result.peerAddresses))

    return result as ParsedMagnet
}

/**
 * Take a torrent object, return a magnet URI.
 * @param {ParsedMagnet} obj A torrent object
 * @returns {string} A magnet URI
 */
export function encode (obj:Partial<ParsedMagnet>) {
    obj = Object.assign({}, obj) // clone obj, so we can mutate it

    // support using convenience names, in addition to spec names
    // (example: `infoHash` for `xt`, `name` for `dn`)

    // Deduplicate xt by using a set
    let xts = new Set<string>()
    if (obj.xt && typeof obj.xt === 'string') xts.add(obj.xt)
    if (obj.xt && Array.isArray(obj.xt)) xts = new Set(obj.xt)
    if (obj.infoHashBuffer) xts.add(`urn:btih:${arr2hex(obj.infoHashBuffer as Uint8Array)}`)
    if (obj.infoHash) xts.add(`urn:btih:${obj.infoHash}`)
    if (obj.infoHashV2Buffer) xts.add(obj.xt = `urn:btmh:1220${arr2hex(obj.infoHashV2Buffer)}`)
    if (obj.infoHashV2) xts.add(`urn:btmh:1220${obj.infoHashV2}`)
    const xtsDeduped = Array.from(xts)
    if (xtsDeduped.length === 1) obj.xt = xtsDeduped[0]
    if (xtsDeduped.length > 1) obj.xt = xtsDeduped

    if (obj.publicKeyBuffer) obj.xs = `urn:btpk:${arr2hex(obj.publicKeyBuffer)}`
    if (obj.publicKey) obj.xs = `urn:btpk:${obj.publicKey}`
    if (obj.name) obj.dn = obj.name
    if (obj.keywords) obj.kt = obj.keywords
    if (obj.announce) obj.tr = obj.announce
    if (obj.urlList) {
        obj.ws = obj.urlList
        delete obj.as
    }
    if (obj.peerAddresses) obj['x.pe'] = obj.peerAddresses

    let result = 'magnet:?'
    Object.keys(obj)
        .filter(key => key.length === 2 || key === 'x.pe')
        .forEach((key, i) => {
            const values = Array.isArray(obj[key]) ? obj[key] : [obj[key]]
            values.forEach((val, j) => {
                if ((i > 0 || j > 0) && ((key !== 'kt' && key !== 'so') || j === 0)) result += '&'

                if (key === 'dn') val = encodeURIComponent(val).replace(/%20/g, '+')
                if (key === 'tr' || key === 'as' || key === 'ws') {
                    val = encodeURIComponent(val)
                }
                // Don't URI encode BEP46 keys
                if (key === 'xs' && !val.startsWith('urn:btpk:')) {
                    val = encodeURIComponent(val)
                }
                if (key === 'kt') val = encodeURIComponent(val)
                if (key === 'so') return

                if (key === 'kt' && j > 0) result += `+${val}`
                else result += `${key}=${val}`
            })
            if (key === 'so') result += `${key}=${compose(values)}`
        })

    return result
}

export default { decode, encode }
