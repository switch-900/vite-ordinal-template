export const BoxelInfo = () => {
    return (
        <div className={'pointer-events-none gloww absolute flex flex-col justify-center text-orange-500 p-2 px-3 text-xl'}>

            <div className={'flex'}>
                <div className={'w-6 h-6 min-w-6 bg-orange-400 mt-1.5 mr-1.5 rounded-sm'}></div>

                <span className={'opacity-80 pr-1.5 pt-1'}><i>the</i></span> "<span className={'text-orange-400 text-3xl hover:text-lime-400 pointer-events-auto cursor-crosshair'}>boxel</span>"

            </div>

            <div className={'text-md w-[200px] flex flex-col'}>
                <div>
                    a <span className={'text-orange-300'}>faceted cube</span> with multiple shapes, all in one geometry!
                </div>

                <div className={'text-sm text-orange-300 pt-2 opacity-80'}>
                    the 'angle' shader attribute moves the vertices along their normals
                </div>
            </div>
        </div>
    )
}