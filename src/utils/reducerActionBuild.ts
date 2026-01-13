/**
 * ```
 * const sample = {
 *   create(list: number[]) {
 *     return {
 *       type: 'create',
 *       data: list,
 *     };
 *   },
 *   update(selected: number) {
 *     return {
 *       type: 'update',
 *       data: selected,
 *     };
 *   },
 * };
 *
 * const initData = {
 *   data: [] as number[],
 *   selected: -1,
 * };
 *
 * function reducer(state = initData, act: ActionBuilder<typeof sample>) {
 *   switch (act.type) {
 *     case 'create':
 *       state = {
 *         ...state,
 *         data: act.data,
 *       };
 *       break;
 *     case 'update':
 *       state = {
 *         ...state,
 *         selected: act.data,
 *       };
 *       break;
 *   }
 *   return state;
 * }
 * ```
 * with `useReducer`
 * ```
 * const [state, dispatch] = useReducer(reducer, initData);
 *
 * const acts = createAction(sample)(dispatch);
 *```
 */
export function createReducerAction<T extends Record<string, (arg: any) => any>>(obj: T) {
  return (dispatchEvent: (obj: any) => void) => {
    return Object.keys(obj).reduce((prev, objKey) => {
      Object.assign(prev, {
        [objKey]: (arg: any) => {
          const result = obj[objKey](arg)
          if (result.then) return result.then(dispatchEvent)
          return dispatchEvent(result)
        },
      })
      return prev
    }, {} as { [key in keyof T]: (arg: Parameters<T[key]>[0]) => ReturnType<T[key]> extends Promise<any> ? Promise<void> : void })
  }
}

type Builder<T> = {
  [x in keyof T]: { type: x; data: T[x] extends (arg: infer G) => any ? G : never }
}

export type ReducerActionBuilder<T> = Builder<T>[keyof Builder<T>]
