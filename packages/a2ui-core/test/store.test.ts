import { expect } from 'chai'
import { createA2uiStore } from '../src/store/index'
import { ErrorType } from '../src/store/types'

describe('createA2uiStore', () => {
  describe('初始化测试', () => {
    it('应该成功创建一个新的store实例', () => {
      const store = createA2uiStore()
      expect(store).to.be.an('object')
      expect(store).to.not.be.null
    })

    it('应该创建具有正确初始状态的store', () => {
      const store = createA2uiStore()
      const state = store.getState()

      expect(state.surfaceMap).to.deep.equal({})
      expect(state.hydrateNodeMap).to.deep.equal({})
      expect(state.errorMap).to.deep.equal({})
    })

    it('应该返回具有所有必要操作方法的store', () => {
      const store = createA2uiStore()
      const state = store.getState()

      expect(state.addSurface).to.be.a('function')
      expect(state.updateSurface).to.be.a('function')
      expect(state.deleteSurface).to.be.a('function')
      expect(state.getSurface).to.be.a('function')
      expect(state.addHydrateNode).to.be.a('function')
      expect(state.updateHydrateNode).to.be.a('function')
      expect(state.deleteHydrateNode).to.be.a('function')
      expect(state.getHydrateNode).to.be.a('function')
      expect(state.addError).to.be.a('function')
      expect(state.deleteError).to.be.a('function')
      expect(state.getError).to.be.a('function')
      expect(state.clearErrors).to.be.a('function')
      expect(state.reset).to.be.a('function')
    })

    it('每次调用应该返回独立的store实例', () => {
      const store1 = createA2uiStore()
      const store2 = createA2uiStore()

      expect(store1).to.not.equal(store2)

      store1.getState().addSurface({
        surfaceId: 'surface1',
        beginRender: false,
        rootNode: null
      })

      const state1 = store1.getState()
      const state2 = store2.getState()

      expect(Object.keys(state1.surfaceMap).length).to.equal(1)
      expect(Object.keys(state2.surfaceMap).length).to.equal(0)
    })
  })

  describe('store操作测试', () => {
    it('应该能够添加和获取surface', () => {
      const store = createA2uiStore()
      const state = store.getState()

      const surface = {
        surfaceId: 'surface-1',
        beginRender: true,
        rootNode: null
      }

      state.addSurface(surface)
      const retrieved = state.getSurface('surface-1')

      expect(retrieved).to.deep.equal(surface)
    })

    it('应该能够添加和获取hydrateNode', () => {
      const store = createA2uiStore()
      const state = store.getState()

      const node = {
        componentId: 'node-1',
        _vnode: null,
        ownerSurfaceId: 'surface-1',
        protocol: '{"type":"button"}'
      }

      state.addHydrateNode(node)
      const retrieved = state.getHydrateNode('node-1')

      expect(retrieved).to.deep.equal(node)
    })

    it('应该能够添加和获取error', () => {
      const store = createA2uiStore()
      const state = store.getState()

      const error = {
        type: ErrorType.RENDER_ERROR,
        content: 'Render failed'
      }

      state.addError('error-1', error)
      const retrieved = state.getError('error-1')

      expect(retrieved).to.not.be.undefined
      expect(retrieved?.type).to.equal(error.type)
      expect(retrieved?.content).to.equal(error.content)
      expect(retrieved?.timestamp).to.be.a('number')
    })

    it('应该能够删除surface', () => {
      const store = createA2uiStore()
      let state = store.getState()

      state.addSurface({ surfaceId: 'surface-1', beginRender: false, rootNode: null })
      state = store.getState()
      expect(Object.keys(state.surfaceMap).length).to.equal(1)

      state.deleteSurface('surface-1')
      state = store.getState()
      expect(Object.keys(state.surfaceMap).length).to.equal(0)
    })

    it('应该能够删除hydrateNode', () => {
      const store = createA2uiStore()
      let state = store.getState()

      state.addHydrateNode({ componentId: 'node-1', _vnode: null, ownerSurfaceId: 'surface-1', protocol: '{}' })
      state = store.getState()
      expect(Object.keys(state.hydrateNodeMap).length).to.equal(1)

      state.deleteHydrateNode('node-1')
      state = store.getState()
      expect(Object.keys(state.hydrateNodeMap).length).to.equal(0)
    })

    it('应该能够清空所有errors', () => {
      const store = createA2uiStore()
      let state = store.getState()

      state.addError('error-1', { type: ErrorType.PARSE_ERROR, content: 'Error 1' })
      state.addError('error-2', { type: ErrorType.RENDER_ERROR, content: 'Error 2' })
      state = store.getState()
      expect(Object.keys(state.errorMap).length).to.equal(2)

      state.clearErrors()
      state = store.getState()
      expect(Object.keys(state.errorMap).length).to.equal(0)
    })

    it('应该能够重置store状态', () => {
      const store = createA2uiStore()
      let state = store.getState()

      state.addSurface({ surfaceId: 'surface-1', beginRender: false, rootNode: null })
      state.addHydrateNode({ componentId: 'node-1', _vnode: null, ownerSurfaceId: 'surface-1', protocol: '{}' })
      state.addError('error-1', { type: ErrorType.PARSE_ERROR, content: 'Error' })

      state = store.getState()
      expect(Object.keys(state.surfaceMap).length).to.equal(1)
      expect(Object.keys(state.hydrateNodeMap).length).to.equal(1)
      expect(Object.keys(state.errorMap).length).to.equal(1)

      state.reset()
      state = store.getState()

      expect(state.surfaceMap).to.deep.equal({})
      expect(state.hydrateNodeMap).to.deep.equal({})
      expect(state.errorMap).to.deep.equal({})
    })
  })
})