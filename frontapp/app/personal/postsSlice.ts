import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/app/utils/api'

export interface Post {
  id: number
  title: string
  content: string
  imageUrl?: string
}

interface PostsState {
  items: Post[]
  hasMore: boolean
  loading: boolean
  lastPostId: number | null
}

const SIZE = 10

const initialState: PostsState = {
  items: [],
  hasMore: true,
  loading: false,
  lastPostId: null,
}

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (lastPostId: number | null) => {
    const res = await api.get('/api/v1/posts', {
      params: {
        lastPostId: lastPostId ?? Number.MAX_SAFE_INTEGER,
        size: SIZE,
      },
    })
    return res.data.data // Post[] 가 온다고 가정
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts(state) {
      state.items = []
      state.hasMore = true
      state.lastPostId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const newPosts = action.payload

        if (newPosts.length < SIZE) {
          state.hasMore = false
        }

        state.items = [...state.items, ...newPosts]

        if (newPosts.length > 0) {
          state.lastPostId = newPosts[newPosts.length - 1].id
        }

        state.loading = false
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { resetPosts } = postsSlice.actions
export default postsSlice.reducer