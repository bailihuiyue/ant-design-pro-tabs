import { queryTags } from './service';

const Model = {
  namespace: 'dashboardAndmonitor',
  state: {
    tags: [],
  },
  effects: {
    *fetchTags(_, { call, put }) {
      const response = yield call(queryTags);
      yield put({
        type: 'saveTags',
        payload: response.list,
      });
    },
  },
  reducers: {
    saveTags(state, action) {
      return { ...state, tags: action.payload };
    },
  },
};
export default Model;
