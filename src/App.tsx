import React, {useCallback, useContext, useEffect, useMemo} from 'react'
import 'tippy.js/dist/tippy.css'
import {useAppDispatch, useAppSelector} from './hooks/redux'
import {setEnvData, setEnvReady, setFold, setPage, setTempData, setTempReady} from './redux/envReducer'
import Header from './biz/Header'
import Body from './biz/Body'
import useSubtitleService from './hooks/useSubtitleService'
import {cloneDeep} from 'lodash-es'
import {EVENT_EXPAND, MESSAGE_TO_INJECT_FOLD, PAGE_MAIN, PAGE_SETTINGS, STORAGE_ENV, STORAGE_TEMP} from './const'
import {EventBusContext} from './Router'
import useTranslateService from './hooks/useTranslateService'
import Settings from './biz/Settings'
import {handleJson} from '@kky002/kky-util'
import {useLocalStorage} from '@kky002/kky-hooks'
import {Toaster} from 'react-hot-toast'
import {setTheme} from './util/biz_util'
import {sendInject} from './util/biz_util'
import useSearchService from './hooks/useSearchService'
import useMessageService from './hooks/useMessageService'

function App() {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.envData)
  const tempData = useAppSelector(state => state.env.tempData)
  const fold = useAppSelector(state => state.env.fold)
  const eventBus = useContext(EventBusContext)
  const page = useAppSelector(state => state.env.page)
  const totalHeight = useAppSelector(state => state.env.totalHeight)

  const foldCallback = useCallback(() => {
    dispatch(setFold(!fold))
    dispatch(setPage(PAGE_MAIN))
    sendInject(MESSAGE_TO_INJECT_FOLD, {fold: !fold})
  }, [dispatch, fold])

  // handle event
  eventBus.useSubscription((event: any) => {
    if (event.type === EVENT_EXPAND) {
      if (fold) {
        foldCallback()
      }
    }
  })

  // env数据
  const savedEnvData = useMemo(() => {
    return handleJson(cloneDeep(envData)) as EnvData
  }, [envData])
  const onLoadEnv = useCallback((data?: EnvData) => {
    if (data != null) {
      dispatch(setEnvData(data))
    }
    dispatch(setEnvReady())
  }, [dispatch])
  useLocalStorage<EnvData>('chrome_client', STORAGE_ENV, savedEnvData, onLoadEnv)

  // temp数据
  const savedTempData = useMemo(() => {
    return handleJson(cloneDeep(tempData)) as TempData
  }, [tempData])
  const onLoadTemp = useCallback((data?: TempData) => {
    if (data != null) {
      dispatch(setTempData(data))
    }
    dispatch(setTempReady())
  }, [dispatch])
  useLocalStorage<TempData>('chrome_client', STORAGE_TEMP, savedTempData, onLoadTemp)

  // theme改变时，设置主题
  useEffect(() => {
    setTheme(envData.theme)
  }, [envData.theme])

  // services
  useSubtitleService()
  useTranslateService()
  useSearchService()
  useMessageService()

  return <div className='select-none w-full' style={{
    height: fold?undefined:`${totalHeight}px`,
  }}>
    <Header foldCallback={foldCallback}/>
    {!fold && page === PAGE_MAIN && <Body/>}
    {!fold && page === PAGE_SETTINGS && <Settings/>}
    <Toaster position='bottom-center'/>
  </div>
}

export default App
