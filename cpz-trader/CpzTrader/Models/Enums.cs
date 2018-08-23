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
        Market
    }

    /// <summary>
    /// состояние ордера
    /// </summary>
    public enum OrderState
    {
        /// <summary>
        /// выставлен
        /// </summary>
        Activ,       

        /// <summary>
        /// исполнен
        /// </summary>
        Done,

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
        /// открываем позицию
        /// </summary>
        Opening,

        /// <summary>
        /// позиция открылась
        /// </summary>
        Open,

        /// <summary>
        /// закрываем позицию
        /// </summary>
        Closing,

        /// <summary>
        /// позиция закрылась
        /// </summary>
        Close,

        /// <summary>
        /// отменить
        /// </summary>
        Cancel,
    }
}
