import SparkMD5 from "spark-md5"

onmessage = async event => {
    const {
        file,
        CHUNK_SIZE,
        startChunkIndex,
        endChunkIndex
    } = event.data
    const proms = []
    for (let i = startChunkIndex; i < endChunkIndex; i ++) {
        proms.push(createChunk(file, i, CHUNK_SIZE))
    }
    const chunks = await Promise.all(proms)
    postMessage(chunks)
}

const createChunk = (file: File, index: number, chunkSize: number) => {
    return new Promise<object>((resolve) => {
        const start = index * chunkSize
        const end = start + chunkSize
        const spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()
        const blob = file.slice(start, end)
        fileReader.onload = event => {
            spark.append(event.target?.result as ArrayBuffer)
            resolve({
                start,
                end,
                index,
                hash: spark.end(),
                blob
            })
        }
        fileReader.readAsArrayBuffer(blob)
    })
}