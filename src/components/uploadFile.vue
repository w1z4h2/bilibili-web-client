<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import SparkMD5 from "spark-md5"

const CHUNK_SIZE = 1024 * 1024 * 10
const THREAD_COUNT = navigator.hardwareConcurrency || 4

const uploadFile = async ({ file }: { file: File }) => {
  const result = await cutFile(file)
}

const cutFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE)
    const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT)
    const result: {hash: string}[] = []
    let finshCount = 0

    for (let i = 0; i < THREAD_COUNT; i++) {
      const worker = new Worker(new URL('../worker/fileMD5Worker.ts', import.meta.url), { type: 'module' })
      const start = i * threadChunkCount
      const end = Math.min((i + 1) * threadChunkCount, chunkCount)
      worker.postMessage({
        file,
        CHUNK_SIZE,
        startChunkIndex: start,
        endChunkIndex: end
      })
      worker.onmessage = event => {
        for (let i = start; i < end; i++) {
          result[i] = event.data[i - start]
        }
        worker.terminate()
        finshCount++
        if (finshCount == THREAD_COUNT) {
          const totleHash = new SparkMD5()
          for (let i = 0; i < result.length; i++) {
            totleHash.append(result[i].hash)
          }
          resolve({
            result,
            totleHash: totleHash.end()
          })
        }
      }
    }
  })
}
</script>

<template>
    <el-upload
    drag
    multiple
    :http-request="uploadFile"
    action="#"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
  </el-upload>
</template>

<style scoped lang="scss">

</style>