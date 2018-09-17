using System;
using System.Collections.Generic;
using System.Text;

namespace CpzTrader.Models
{
    /// <summary>
    /// состояние позиции
    /// </summary>
    public enum PositionState
    {
        /// <summary>
        /// открывается, выставлен ордер на открытие позиции
        /// </summary>
        Opening,

        /// <summary>
        /// открыта
        /// </summary>
        Open,

        /// <summary>
        /// закрывается, выставлен ордер на закрытие
        /// </summary>
        Closing,

        /// <summary>
        /// закрыта
        /// </summary>
        Close,

        Canceled
    }

    /// <summary>
    /// тип ордера
    /// </summary>
    public enum OrderType
    {
        /// <summary>
        /// лимитный
        /// </summary>
        Limit,

        /// <summary>
        /// по рынку
        /// </summary>
        Market,

        /// <summary>
        /// стоп лосс
        /// </summary>
        Stop
    }

    /// <summary>
    /// состояние ордера
    /// </summary>
    public enum OrderState
    {
        /// <summary>
        /// выставлен
        /// </summary>
        Open,       

        /// <summary>
        /// исполнен
        /// </summary>
        Closed,

        /// <summary>
        /// отменен
        /// </summary>
        Canceled,
    }

    /// <summary>
    /// тип сигнала пришедшего от советника
    /// </summary>
    public enum ActionType
    {    
        /// <summary>
        /// новая позиция
        /// </summary>
        NewPosition,

        /// <summary>
        /// открытие длинной позиции
        /// </summary>
        Long,

        /// <summary>
        /// закрытие длинной позиции
        /// </summary>
        CloseLong,

        /// <summary>
        /// открытие короткой позиции
        /// </summary>
        Short,

        /// <summary>
        /// закрытие короткой позиции
        /// </summary>
        CloseShort,

        /// <summary>
        /// проверить ордер
        /// </summary>
        CheckOrder,

        /// <summary>
        /// отменить ордер
        /// </summary>
        CancelOrder,
    }
}
