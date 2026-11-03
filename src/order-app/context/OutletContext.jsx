import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { shopApi } from '../services/shopApi';

const OutletContext = createContext(null);
const STORAGE_KEY = 'rajubhai.outlet';

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};
const writeStored = (id) => {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the choice just will not persist */
  }
};
const readQuery = () => {
  try {
    return new URLSearchParams(window.location.search).get('outlet') || '';
  } catch {
    return '';
  }
};

export const OutletProvider = ({ children }) => {
  const [outlets, setOutlets] = useState([]);
  const [outletId, setOutletIdState] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) the enabled outlets, then pick: ?outlet=, stored choice, the only outlet, else the picker.
  useEffect(() => {
    let alive = true;
    shopApi
      .getOutlets()
      .then((list) => {
        if (!alive) return;
        setOutlets(list);
        const known = (id) => !!id && list.some((o) => o.id === id);
        const fromQuery = readQuery();
        const stored = readStored();
        let pick = '';
        if (known(fromQuery)) {
          pick = fromQuery;
          writeStored(fromQuery);
        } else if (known(stored)) pick = stored;
        else if (list.length === 1) pick = list[0].id;
        setOutletIdState(pick);
        if (!pick) setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 2) the chosen outlet's info
  useEffect(() => {
    if (!outletId) {
      setInfo(null);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    shopApi
      .getInfo(outletId)
      .then((data) => {
        if (!alive) return;
        setInfo(data);
        setError(null);
      })
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [outletId]);

  // Raw setter. UI should call useSwitchOutlet() so a non-empty cart asks before it is cleared.
  const setOutletId = useCallback((id) => {
    writeStored(id);
    setOutletIdState(id || '');
  }, []);

  // Re-read the outlet's info (open/closed, closed message) without the page-level loading state.
  const refreshInfo = useCallback(() => {
    if (!outletId) return Promise.resolve();
    return shopApi
      .getInfo(outletId)
      .then((data) => setInfo(data))
      .catch(() => {});
  }, [outletId]);

  const outlet = useMemo(() => outlets.find((o) => o.id === outletId) || null, [outlets, outletId]);
  const value = useMemo(
    () => ({ outlets, outlet, outletId, info, setOutletId, refreshInfo, loading, error }),
    [outlets, outlet, outletId, info, setOutletId, refreshInfo, loading, error]
  );
  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
};

export const useOutlet = () => useContext(OutletContext);
